// Frame thresholds (local to the Editor scene, 0-389 / 13s) driving the
// real editor's demo — see public/wapi-real/vendor/editor-director.js.
//
// Before `openModal`, the real editor sits on its own product list
// (empty, since the director resets it) with the real logo/banner already
// showing — a brief establishing beat before we open the "add product"
// flow, per the brief's "mostrar logo/banner/config" step.
//
// From `openModal` on it follows the modal's real top-to-bottom order
// (foto → nombre → precio → descripción → categoría → guardar), then
// `bulkLoad` reveals the rest of the catalog's products at once — quickly,
// on purpose, since the brief only wants ONE full load shown in detail.
export const EDITOR_CUES = {
  openModal: 75,
  pickImage: 110,
  nameDone: 180,
  priceDone: 195,
  descDone: 285,
  category: 313,
  saved: 345,
  bulkLoad: 362,
};
