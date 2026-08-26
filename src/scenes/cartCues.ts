// Frame thresholds driving the real catalog page's cart/checkout demo —
// see public/wapi-real/vendor/catalog-director.js. Scene-local: 0 is the
// start of this scene's own Sequence.
export const CART_CUES = {
  // Smooth scroll (not a snap) from the top down to the products grid —
  // sped up, this whole "selecting products" stretch read as too slow.
  scrollStart: 15,
  scrollEnd: 35,
  addItem1: 45,
  addItem2: 65,
  openCart: 95,
  // Real pause reading the cart summary (items + total) before sending —
  // this part read fine, so it keeps the same hold length as before.
  sendOrder: 190,
};
