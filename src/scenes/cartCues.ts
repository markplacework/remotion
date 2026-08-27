// Frame thresholds driving the real catalog page's cart/checkout demo —
// see public/wapi-real/vendor/catalog-director.js. Scene-local: 0 is the
// start of this scene's own Sequence.
export const CART_CUES = {
  // A beat longer on the cover banner before the scroll kicks in (+45f
  // / 1.5s vs. the original scrollStart:20), so the store's main
  // banner actually registers before the tour starts moving.
  //
  // A full scroll down to the very bottom of the page — the whole
  // catalog, not just the products grid — then back up to the grid
  // once it's time to actually add items. A touch faster than the
  // first pass (still eased, not a snap).
  scrollStart: 65,
  scrollDownEnd: 135,
  scrollBackStart: 165,
  scrollBackEnd: 200,
  addItem1: 220,
  addItem2: 255,
  openCart: 290,
  // sendOrder itself stays put (unshifted) so SCENE_CART's total length
  // — and everything timed off it downstream (WhatsAppScene's start
  // frame, voiceover sync) — doesn't move. The added 45f up front comes
  // out of this pause instead (still a real beat to read the cart
  // summary, just 45f/1.5s instead of 90f/3s).
  sendOrder: 335,
};
