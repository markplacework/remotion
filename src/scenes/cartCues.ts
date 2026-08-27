// Frame thresholds driving the real catalog page's cart/checkout demo —
// see public/wapi-real/vendor/catalog-director.js. Scene-local: 0 is the
// start of this scene's own Sequence.
export const CART_CUES = {
  // A full scroll down to the very bottom of the page — the whole
  // catalog, not just the products grid — then back up to the grid
  // once it's time to actually add items. A touch faster than the
  // first pass (still eased, not a snap).
  scrollStart: 20,
  scrollDownEnd: 90,
  scrollBackStart: 120,
  scrollBackEnd: 155,
  addItem1: 175,
  addItem2: 210,
  openCart: 245,
  // Pause reading the cart summary (items + total) before sending.
  sendOrder: 335,
};
