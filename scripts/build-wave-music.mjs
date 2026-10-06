// Builds a single self-contained HTML of the Wave Music lyric test
// (CSS, JS modules, demo audio and background all inlined), so it can be
// opened in any previewer without a server or the public/ folder.
//
//   node scripts/build-wave-music.mjs
//
// Output: public/wave-music/wave-music-standalone.html
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "public/wave-music");
const read = (p) => readFileSync(join(dir, p), "utf8");
const dataUri = (buf, mime) => `data:${mime};base64,${buf.toString("base64")}`;

// The background PNG is large; a high-quality JPEG looks the
// same behind the bubbles at a fraction of the size, if ImageMagick is
// around. Falls back to the PNG as-is.
function backgroundUri() {
  const png = join(root, "public/fake-chat/background-alt.png");
  try {
    const jpg = execFileSync("convert", [png, "-quality", "86", "jpg:-"], { maxBuffer: 1 << 26 });
    return dataUri(jpg, "image/jpeg");
  } catch {
    return dataUri(readFileSync(png), "image/png");
  }
}

let html = read("index.html");

html = html.replace(/src="(assets\/[^"]+\.(jpg|png))"/g, (_, src, ext) =>
  `src="${dataUri(readFileSync(join(dir, src)), ext === "png" ? "image/png" : "image/jpeg")}"`,
);

html = html.replace(/<link rel="stylesheet" href="styles.css" \/>/, () => `<style>\n${read("styles.css")}</style>`);

html = html.replace(/<script src="(js\/[^"]+)"><\/script>/g, (_, src) => {
  let js = read(src);
  if (src === "js/demo.js") {
    js = js
      .replace('"../fake-chat/background-alt.png"', () => JSON.stringify(backgroundUri()))
      .replace('"../fake-chat/song.mp3"', () =>
        JSON.stringify(dataUri(readFileSync(join(root, "public/fake-chat/song.mp3")), "audio/mpeg")),
      );
  }
  return `<script>\n${js}</script>`;
});

const out = join(dir, "wave-music-standalone.html");
writeFileSync(out, html);
console.log(`Wrote ${out} (${(Buffer.byteLength(html) / 1e6).toFixed(2)} MB)`);
if (!existsSync(out)) process.exit(1);
