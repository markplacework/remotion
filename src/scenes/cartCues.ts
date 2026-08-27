// Frame thresholds driving the real catalog page's cart/checkout demo —
// see public/wapi-real/vendor/catalog-director.js. Scene-local: 0 is the
// start of this scene's own Sequence.
export const CART_CUES = {
  // A beat longer on the cover banner before the scroll kicks in (+60f
  // / 2s total vs. the original scrollStart:20 — 45f then +15f more),
  // so the store's main banner actually registers before the tour
  // starts moving.
  //
  // A full scroll down to the very bottom of the page — the whole
  // catalog, not just the products grid — then back up to the grid
  // once it's time to actually add items. A touch faster than the
  // first pass (still eased, not a snap).
  scrollStart: 80,
  scrollDownEnd: 150,
  scrollBackStart: 180,
  scrollBackEnd: 215,
  addItem1: 235,
  addItem2: 270,
  openCart: 305,
  // sendOrder itself stays put (unshifted) so SCENE_CART's total length
  // — and everything timed off it downstream (WhatsAppScene's start
  // frame, voiceover sync) — doesn't move. The added time up front
  // comes out of this pause instead (now 30f/1s, down from the
  // original 90f/3s).
  sendOrder: 335,
};
