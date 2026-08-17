export const FPS = 30;

// 15s exact: Presentación 3s, Editor 4s, Catálogo 5s, CTA 3s.
export const SCENE_1_HOOK = 3 * FPS;
export const SCENE_2_EDITOR = 4 * FPS;
export const SCENE_3_CATALOG = 5 * FPS;
export const SCENE_4_CTA = 3 * FPS;

export const TOTAL_DURATION =
  SCENE_1_HOOK + SCENE_2_EDITOR + SCENE_3_CATALOG + SCENE_4_CTA;

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
