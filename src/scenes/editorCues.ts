// Frame thresholds (local to Scene 2, 0-329 / 11s) driving the real
// editor's "add one product" demo — see
// public/wapi-real/vendor/editor-director.js.
//
// Follows the modal's real top-to-bottom order (foto → nombre → precio →
// descripción → categoría → guardar) with a deliberate pause after each
// beat so every field reads clearly before the next one starts.
export const EDITOR_CUES = {
  openModal: 28,
  pickImage: 60,
  nameDone: 130,
  priceDone: 145,
  descDone: 185,
  category: 215,
  saved: 250,
  bulkLoad: 275,
};
