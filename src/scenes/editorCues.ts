// Frame thresholds (local to the Editor scene / 18s) driving the real
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
  openModal: 220,
  pickImage: 255,
  nameDone: 325,
  priceDone: 340,
  descDone: 430,
  category: 458,
  saved: 490,
  bulkLoad: 507,
};
