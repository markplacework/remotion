// Frame thresholds (local to the Editor scene / 27s) driving the real
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
  // The single-product walkthrough is the one part of the whole video
  // meant to read like an actual demo, not a quick cut. Each field below
  // has its own start cue with a real still pause after the previous
  // field settles — not just typing running straight into the next
  // field — so the whole thing reads as deliberate, not rushed.
  nameStart: 305,
  nameDone: 415,
  priceStart: 435,
  priceDone: 475,
  descStart: 500,
  descDone: 660,
  category: 690,
  saved: 735,
  bulkLoad: 775,
  // Real "Personalizar colores" panel (colorsFab -> dOpen), cycling through
  // real predefined presets (COLOR_PRESETS / applyColorPreset in the
  // source app) for header + footer. Starts once the loaded catalog has
  // had a moment to settle after bulkLoad.
  colorsOpen: 815,
  // Verde is already the active preset the instant the panel opens (it's
  // the app's own default), so it just holds before the first transition.
  colorsHoldFirst: 30,
  // Per subsequent preset: colorsTransitionFrames to crossfade in, then
  // the remainder of colorsStepFrames to hold before the next one starts
  // — a real pause on each color, not a rapid-fire cycle.
  colorsStepFrames: 90,
  colorsTransitionFrames: 30,
};
