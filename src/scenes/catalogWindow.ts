export type CatalogWindow = Window & {
  _goPortada?: (index: number) => void;
  _nextPortada?: () => void;
};

/**
 * The real catalog page auto-advances its top carousel on a real
 * setInterval(3000ms). During rendering that runs on real wall-clock time
 * while we're driving the same carousel from the (much slower, frame-by-
 * frame) video timeline — the two fight over `_goPortada`, which looked
 * like glitchy/erratic slide-jumping in the rendered video. Neutralizing
 * the auto-advance leaves our explicit per-frame calls as the only thing
 * moving the carousel.
 */
export function stopPortadaAutoplay(win: Window): void {
  (win as CatalogWindow)._nextPortada = () => {};
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
  const cw = win as CatalogWindow;
  cw._nextPortada = () => {};
  const track = win.document.getElementById("portadasTrack");
  if (track) track.style.transition = "none";
  cw._goPortada?.(index);
}
