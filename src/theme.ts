export const FPS = 30;

// Not a forced exact duration — each scene gets whatever length its beat
// actually needs to read clearly at a natural pace (brief: 20-25s is the
// target, up to ~30s is fine if it keeps things clear). Comes out to
// ~26.5s: Intro (text only, gancho) 4s, Editor real (mockup only — intro
// + cargar un producto + ver todos cargados) 13s, Catálogo publicado
// (mockup only) 5.5s, Cierre (text only) 4s.
//
// Text and mockup never share a scene — every scene is either pure copy
// on a plain background or the product on its own with no caption.
export const SCENE_INTRO = 4 * FPS;
export const SCENE_EDITOR = 13 * FPS;
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
