// Produces the versions of the real Wapi editor/catalog HTML that this
// video project actually renders: same markup/CSS/JS as the originals in
// wapi-source/, with only the network-facing bits swapped for local,
// offline equivalents (Supabase → local shim + injected business data,
// Google Fonts / Lucide CDN → self-hosted copies already in
// public/wapi-real/vendor/). No visual/behavioral change otherwise.
//
// All references injected here are RELATIVE to each output file's own
// location — Remotion serves public/ under a base path that varies by
// context (Studio, still, render), so absolute "/xxx" paths inside an
// iframed page are not reliable; relative ones always resolve correctly
// against the iframe document's own real URL.
//
// Usage: node scripts/patch-wapi-html.mjs <business-slug>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node scripts/patch-wapi-html.mjs <business-slug>");
  process.exit(1);
}

const businessData = JSON.parse(
  readFileSync(path.join(root, "src/business", `${slug}.json`), "utf8"),
);

// catalogo_v28.html resolves its business slug from the URL PATH itself
// (/catalogo/<slug>, its own legacy-compatible route) — so, unmodified, it
// needs to be served at that exact path shape for CATALOG_PARAM to be
// non-null. The shim ignores the slug's actual value (single fixed
// business record), so the literal filename doesn't matter beyond that.
const catalogoOutDir = path.join(root, "public/catalogo");
const editorOutDir = path.join(root, "public/wapi-real", slug);
mkdirSync(catalogoOutDir, { recursive: true });
mkdirSync(editorOutDir, { recursive: true });

const GOOGLE_FONTS_PRECONNECT = '<link rel="preconnect" href="https://fonts.googleapis.com">\n';
const GOOGLE_FONTS_LINK_RE =
  /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Nunito[^"]*" rel="stylesheet">\n?/;

const SUPABASE_CDN_RE =
  /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2"><\/script>\n?/;

function localizeLucide(html, vendorBase) {
  return html.replace(
    /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/lucide@latest\/dist\/umd\/lucide\.min\.js"([^>]*)>\s*<\/script>/,
    `<script src="${vendorBase}/lucide.min.js"$1></script>`,
  );
}

function stripIntlTelInput(html) {
  html = html.replace(
    /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/intl-tel-input[^"]*"><\/script>\n?/,
    "",
  );
  html = html.replace(
    /<link rel="stylesheet" href="https:\/\/cdn\.jsdelivr\.net\/npm\/intl-tel-input[^"]*">\n?/,
    "",
  );
  return html;
}

// businessData's asset paths are authored as root-relative
// ("/business/<slug>/..."); rewrite them to be relative to whichever
// output file will embed this data.
function localizedBusinessDataScript(businessAssetBase) {
  const withRelativeAssets = JSON.stringify(businessData).replaceAll(
    `/business/${slug}/`,
    `${businessAssetBase}/`,
  );
  return `<script>window.__WAPI_BUSINESS_DATA__ = ${withRelativeAssets};</script>\n`;
}

function patchCommon(html, { vendorBase, businessAssetBase }) {
  html = html.replace(GOOGLE_FONTS_PRECONNECT, "");
  html = html.replace(GOOGLE_FONTS_LINK_RE, `<link rel="stylesheet" href="${vendorBase}/fonts.css">\n`);
  html = html.replace(
    SUPABASE_CDN_RE,
    localizedBusinessDataScript(businessAssetBase) +
      `<script src="${vendorBase}/supabase-shim.js"></script>\n`,
  );
  html = localizeLucide(html, vendorBase);
  html = stripIntlTelInput(html);
  return html;
}

// ---- catalogo (public/catalogo/<slug>.html) ----
{
  const src = readFileSync(path.join(root, "wapi-source/catalogo_v28.html"), "utf8");
  const patched = patchCommon(src, {
    vendorBase: "../wapi-real/vendor",
    businessAssetBase: `../business/${slug}`,
  });
  const outFile = path.join(catalogoOutDir, `${slug}.html`);
  writeFileSync(outFile, patched);
  console.log("wrote", outFile, `(${patched.length} bytes)`);
}

// ---- editor (public/wapi-real/<slug>/editor.html) ----
{
  let src = readFileSync(path.join(root, "wapi-source/editor_v27.html"), "utf8");
  src = patchCommon(src, {
    vendorBase: "../vendor",
    businessAssetBase: `../../business/${slug}`,
  });

  const director = readFileSync(
    path.join(root, "public/wapi-real/vendor/editor-director.js"),
    "utf8",
  );

  // Splice the director into the SAME <script> block as the app code so it
  // shares lexical scope with `let products`, `let currentImgsData`, etc.
  // That main script is the one ending right before </body>.
  const lastScriptClose = src.lastIndexOf("</script>");
  if (lastScriptClose === -1) {
    throw new Error("editor_v27.html: could not find main </script> to splice into");
  }
  src = src.slice(0, lastScriptClose) + "\n" + director + "\n" + src.slice(lastScriptClose);

  const outFile = path.join(editorOutDir, "editor.html");
  writeFileSync(outFile, src);
  console.log("wrote", outFile, `(${src.length} bytes)`);
}
