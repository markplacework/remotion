// Frame thresholds (local to the Editor scene / 21.5s) driving the real
// editor's demo — see public/wapi-real/vendor/editor-director.js.
//
// Follows the real dashboard's own top-to-bottom order: logo → descripción
// del negocio → portada → luego el modal de "agregar producto" (foto →
// nombre → precio → descripción → categoría → guardar) para UN producto,
// y por último se revela el resto del catálogo ya cargado. Every beat
// replays from an empty state so Remotion can request any frame in any
// order and still land on the right visual result.
export const EDITOR_CUES = {
  logoUpload: 20,
  descOpen: 60,
  descTyped: 136,
  descSaved: 156,
  portadaUpload: 180,
  // A longer hold than the other snap-in beats — the portada is a big,
  // photo-heavy change and needs more time to actually register before
  // cutting to the product modal.
  openModal: 250,
  pickImage: 285,
  // The single-product walkthrough (foto → nombre → precio → descripción
  // → categoría → guardar) reads as rushed at a brisk pace — this is the
  // one part of the whole video meant to read like an actual demo, not a
  // quick cut, so every step here gets more room than elsewhere.
  nameDone: 375,
  priceDone: 400,
  descDone: 510,
  category: 545,
  saved: 585,
  bulkLoad: 610,
};
