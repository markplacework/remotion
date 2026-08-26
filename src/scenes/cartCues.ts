// Frame thresholds driving the real catalog page's cart/checkout demo —
// see public/wapi-real/vendor/catalog-director.js. Scene-local: 0 is the
// start of this scene's own Sequence.
export const CART_CUES = {
  // Smooth scroll (not a snap) from the top down to the products grid.
  scrollStart: 20,
  scrollEnd: 55,
  // Each add gets its own still beat before the next — same "no field
  // runs straight into the next" principle used in the editor demo.
  addItem1: 70,
  addItem2: 115,
  // A longer pause before opening the cart — let the second item's badge
  // update register first.
  openCart: 165,
  // Real pause reading the cart summary (items + total) before sending.
  sendOrder: 260,
};
