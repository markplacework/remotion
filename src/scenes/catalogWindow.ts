export type CatalogWindow = Window & {
  _goPortada?: (index: number) => void;
  __realGoPortada?: (index: number) => void;
};

/**
 * The real catalog page auto-advances its top carousel via
 * setInterval(_nextPortada, 3000). Reassigning `_nextPortada` doesn't stop
 * it — setInterval captured that function *reference* at schedule time, so
 * a later reassignment never reaches the already-running timer. What DOES
 * work: `_nextPortada`'s body calls `_goPortada` by identifier, resolved
 * live on every tick (normal JS scoping, not a captured reference) — and
 * `_goPortada` is a top-level `function` declaration, so it really is
 * `window._goPortada`, reassignable from here. Blocking it there kills the
 * auto-timer's effect entirely; we keep a copy of the original to drive
 * the carousel ourselves.
 */
function killPortadaAutoplay(win: Window): void {
  const cw = win as CatalogWindow;
  if (!cw.__realGoPortada && cw._goPortada) {
    cw.__realGoPortada = cw._goPortada;
  }
  cw._goPortada = () => {};
}

/**
 * Jumps the real portadas carousel straight to `index` — no animation.
 *
 * The carousel's slide is a real CSS transition (0.45s of *wall-clock*
 * time). Remotion captures each video frame as a discrete screenshot, not
 * real continuous playback, so whatever fraction of that 0.45s happened to
 * elapse in real rendering time by the moment of capture is essentially
 * random — the slide would appear frozen mid-swipe at an arbitrary,
 * inconsistent position from frame to frame, which reads as glitchy. Since
 * our own frame-driven index changes already hold each slide for a couple
 * of seconds, a clean instant cut looks intentional rather than a bug.
 */
export function driveCatalogCarousel(win: Window, index: number): void {
  killPortadaAutoplay(win);
  const track = win.document.getElementById("portadasTrack");
  if (track) track.style.transition = "none";
  (win as CatalogWindow).__realGoPortada?.(index);
}

/** For scenes that just need the real timer neutralized and never touch
 * the carousel index themselves (it stays wherever it loaded). */
export function stopPortadaAutoplay(win: Window): void {
  killPortadaAutoplay(win);
}
