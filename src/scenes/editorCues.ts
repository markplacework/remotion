// Frame thresholds (local to the Editor scene / 19s) driving the real
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
  nameDone: 355,
  priceDone: 370,
  descDone: 460,
  category: 488,
  saved: 520,
  bulkLoad: 537,
};
