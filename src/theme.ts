export const FPS = 30;

// Not a forced exact duration — each scene gets whatever length its beat
// actually needs to read clearly at a natural pace (brief: 20-25s is the
// target, more if needed to keep things clear — and the editor beat below
// grew on request to show the full setup, not just one product, and again
// twice more to slow the product-load walkthrough down to a genuinely
// unhurried pace, once more to add the real color-customization demo
// after the products load, once more to add the promo-banner upload
// alongside the top portada, and then trimmed back down ~20% on request
// where the single-product walkthrough felt too slow). Comes out to
// ~52.5s: Intro (text only, gancho) 4s, Editor real (mockup only — logo,
// descripción, portada superior, banner inferior, cargar un producto,
// ver todos cargados, personalizar colores) 39s, Catálogo publicado
// (mockup only) 5.5s, Cierre (text only) 4s.
//
// Text and mockup never share a scene — every scene is either pure copy
// on a plain background or the product on its own with no caption.
export const SCENE_INTRO = 4 * FPS;
// ShowcaseScene.tsx (the 4-reference-image carousel) is out of the video
// again for now, but left in the project rather than deleted in case it
// comes back — these two stay defined since that file still imports them.
export const SHOWCASE_IMAGE_COUNT = 4;
export const SHOWCASE_SEGMENT_FRAMES = 40;
export const SCENE_EDITOR = 39 * FPS;
export const SCENE_CATALOG = 5.5 * FPS;
export const SCENE_CIERRE = 4 * FPS;

// Each scene crossfades into the next over this many frames (with a brief
// motion-blur whip on the outgoing scene) instead of cutting hard.
export const TRANSITION_FRAMES = 12;

export const TOTAL_DURATION = SCENE_INTRO + SCENE_EDITOR + SCENE_CATALOG + SCENE_CIERRE;

export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;

// Fixed internal viewport the real Wapi pages are rendered at (mobile —
// both the editor and the public catalog are mobile-first real layouts;
// wide viewports trigger Wapi's own real "use your phone" gate).
export const WAPI_VIEWPORT_WIDTH = 402;
export const WAPI_VIEWPORT_HEIGHT = 874;

// wapiGreen/wapiGreenLight match Wapi's own real CSS variables
// (--wa-dark / --wa-green in the source app) — not invented.
export const COLORS = {
  black: "#050706",
  ink: "#0a0f0c",
  wapiGreen: "#128C7E",
  wapiGreenLight: "#25D366",
  white: "#FFFFFF",
  offWhite: "#EAF3EE",
} as const;
