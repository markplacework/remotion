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
