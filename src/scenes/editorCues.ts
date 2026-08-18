// Frame thresholds (local to the Editor scene) driving the real editor's
// demo — see public/wapi-real/vendor/editor-director.js.
//
// Follows the real dashboard's own top-to-bottom order: logo → descripción
// del negocio → portada (superior) → banner antes del footer (inferior) →
// luego el modal de "agregar producto" (foto → nombre → precio →
// descripción → categoría → guardar) para UN producto, y por último se
// revela el resto del catálogo ya cargado + personalizar colores. Every
// beat replays from an empty state so Remotion can request any frame in
// any order and still land on the right visual result.
export const EDITOR_CUES = {
  logoUpload: 20,
  descOpen: 60,
  descTyped: 136,
  descSaved: 156,
  portadaUpload: 180,
  // Same "give it real time to register" gap as portadaUpload -> openModal
  // used to have — both are big, photo-heavy changes.
  promoBannerUpload: 250,
  openModal: 320,
  pickImage: 355,
  // The single-product walkthrough is the one part of the whole video
  // meant to read like an actual demo, not a quick cut. Each field below
  // has its own start cue with a real still pause after the previous
  // field settles — not just typing running straight into the next
  // field — so the whole thing reads as deliberate, not rushed.
  nameStart: 375,
  nameDone: 485,
  priceStart: 505,
  priceDone: 545,
  descStart: 570,
  descDone: 730,
  category: 760,
  saved: 805,
  bulkLoad: 845,
  // Real "Personalizar colores" panel (colorsFab -> dOpen), cycling through
  // real predefined presets (COLOR_PRESETS / applyColorPreset in the
  // source app) for header + footer. Starts once the loaded catalog has
  // had a moment to settle after bulkLoad.
  //
  // The panel itself is only shown briefly (colorsOpen -> colorsPanelClose)
  // to establish that it's real — it covers up to 88vh of the screen, so
  // the actual header/footer color change would be invisible behind it.
  // It closes again before the preset cycle plays, so what's on screen for
  // the rest of the beat is the real page itself changing color live, not
  // the settings sheet.
  colorsOpen: 885,
  colorsPanelClose: 915,
  // Verde is already the active preset once the panel closes (it's the
  // app's own default), so it just holds, fully visible, before the first
  // live transition starts.
  colorsHoldFirst: 30,
  // Per subsequent preset: colorsTransitionFrames to crossfade in, then
  // the remainder of colorsStepFrames to hold before the next one starts
  // — a real pause on each color, not a rapid-fire cycle.
  colorsStepFrames: 90,
  colorsTransitionFrames: 30,
};
