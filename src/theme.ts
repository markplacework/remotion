export const FPS = 30;

// Not a forced exact duration — each scene gets whatever length its beat
// actually needs to read clearly at a natural pace (brief: 20-25s is the
// target, up to ~30s is fine if it keeps things clear). Comes out to
// ~28.5s: Gancho+Solución 6.5s, Editor real (intro + cargar un producto +
// ver todos cargados) 13s, Catálogo publicado 5.5s, Cierre 3.5s.
export const SCENE_HOOK = 6.5 * FPS;
export const SCENE_EDITOR = 13 * FPS;
export const SCENE_CATALOG = 5.5 * FPS;
export const SCENE_CIERRE = 3.5 * FPS;

// Each scene crossfades into the next over this many frames (with a brief
// motion-blur whip on the outgoing scene) instead of cutting hard.
export const TRANSITION_FRAMES = 12;

export const TOTAL_DURATION = SCENE_HOOK + SCENE_EDITOR + SCENE_CATALOG + SCENE_CIERRE;

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
