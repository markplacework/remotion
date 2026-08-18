export type CatalogWindow = Window & {
  _goPortada?: (index: number) => void;
  __realGoPortada?: (index: number) => void;
};

/**
 * The real catalog page's own script (see
 * public/wapi-real/vendor/catalog-director.js, spliced into the page at
 * build time) already blocks `_goPortada` synchronously at load, before
 * the real setInterval(_nextPortada, 3000) ever gets a live `_goPortada`
 * to call. This is just a defensive fallback in case that didn't run —
 * doing the same override reactively here, saving a copy of the original
 * to drive the carousel ourselves.
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
  // The pagination dots have their own CSS transition (width + color, on
  // the .active class toggle inside _goPortada) — a separate, easy-to-miss
  // source of the same "caught mid-animation" glitch if left alone.
  win.document.querySelectorAll<HTMLElement>(".pdot").forEach((dot) => {
    dot.style.transition = "none";
  });
  (win as CatalogWindow).__realGoPortada?.(index);
}

/** For scenes that just need the real timer neutralized and never touch
 * the carousel index themselves (it stays wherever it loaded). */
export function stopPortadaAutoplay(win: Window): void {
  killPortadaAutoplay(win);
}
