export const FPS = 30;

// 20s exact: Presentación 3.5s, Editor 7s, Catálogo 6s, CTA 3.5s.
// Editor gets the biggest share — it's the scene with the most real
// interaction to follow (open modal, type, pick photo, category, save).
export const SCENE_1_HOOK = 3.5 * FPS;
export const SCENE_2_EDITOR = 7 * FPS;
export const SCENE_3_CATALOG = 6 * FPS;
export const SCENE_4_CTA = 3.5 * FPS;

// Each scene crossfades into the next over this many frames (with a brief
// motion-blur whip on the outgoing scene) instead of cutting hard.
export const TRANSITION_FRAMES = 12;

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
