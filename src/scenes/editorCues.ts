// Frame thresholds (local to Scene 2, 0-389 / 13s) driving the real
// editor's "add one product" demo — see
// public/wapi-real/vendor/editor-director.js.
//
// Follows the modal's real top-to-bottom order (foto → nombre → precio →
// descripción → categoría → guardar) with a deliberate pause after each
// beat so every field reads clearly before the next one starts. The
// description gets the most time of any single step (90 frames / 3s) —
// it's a full sentence, not a couple of words like the name.
export const EDITOR_CUES = {
  openModal: 28,
  pickImage: 60,
  nameDone: 130,
  priceDone: 145,
  descDone: 235,
  category: 265,
  saved: 300,
  bulkLoad: 325,
};
