// Frame thresholds (local to Scene 2, 0-209 / 7s) driving the real
// editor's "add one product" demo — see
// public/wapi-real/vendor/editor-director.js.
//
// Spaced out with a deliberate pause after each beat (type name → pause →
// price → pause → photo → pause → category → pause → save → hold → bulk
// load → hold) so every step reads clearly instead of blurring together.
export const EDITOR_CUES = {
  openModal: 22,
  nameDone: 85,
  priceDone: 95,
  pickImage: 118,
  category: 150,
  saved: 175,
  bulkLoad: 192,
};
