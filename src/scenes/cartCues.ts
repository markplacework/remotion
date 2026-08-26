// Frame thresholds driving the real catalog page's cart/checkout demo —
// see public/wapi-real/vendor/catalog-director.js. Scene-local: 0 is the
// start of this scene's own Sequence.
export const CART_CUES = {
  // Smooth scroll down to the products grid, then a real pause sitting
  // on it — the whole point of this scene is showing the catalog, so
  // it needs to actually stay on screen long enough to read.
  scrollStart: 20,
  scrollEnd: 65,
  addItem1: 115,
  addItem2: 155,
  openCart: 195,
  // Pause reading the cart summary (items + total) before sending.
  sendOrder: 285,
};
