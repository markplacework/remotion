import { EDITOR_CUES } from "./editorCues";

// Frame thresholds for the compressed editor beat used by the 23s
// short-cut ad (WapiAdShort) — reconstructs the same cut structure the
// user's own fast edit landed on (reference video), but driven from
// scratch by the real director/DOM logic in editor-director.js, not a
// re-encode of already-rendered footage. Scene-local: 0 is the start of
// this scene's own Sequence (350 frames total).
const NEVER = 999999;

export const EDITOR_CUES_SHORT: typeof EDITOR_CUES = {
  // The reference shows the logo already there almost immediately after
  // the cut into the editor — an empty flash of only a few frames, not a
  // visible upload beat. Same real dispatch, just placed right at the
  // start instead of skipped.
  logoUpload: 8,
  // Business info modal: opens after a brief empty-state establishing
  // beat, tagline typed fast, socials filled, saved.
  descOpen: 45,
  descTyped: 125,
  descSaved: 150,
  // Portada (top) then the promo banner (bottom, near the footer) —
  // one right after the other, same real upload flow each, matching the
  // full-length video's order. Cut straight to "already uploaded" for
  // each rather than showing the upload itself settle, matching this
  // ad's fast-cut style.
  portadaUpload: 150,
  promoBannerUpload: 180,
  // Product modal: photo already picked, each field typed fast with
  // barely a beat between them, saved, catalog reveal.
  openModal: 215,
  pickImage: 216,
  nameStart: 220,
  nameDone: 250,
  priceStart: 255,
  priceDone: 275,
  // Description gets real typing time plus a hold to actually read it
  // once finished, and category gets a real hold too before saving —
  // both were flashing by too fast to read.
  descStart: 278,
  descDone: 353,
  category: 368,
  saved: 388,
  bulkLoad: 395,
  // Not shown in this cut at all.
  colorsOpen: NEVER,
  colorsPanelClose: NEVER,
  colorsHoldFirst: 30,
  colorsStepFrames: 90,
  colorsTransitionFrames: 30,
};
