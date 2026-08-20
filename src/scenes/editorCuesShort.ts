import { EDITOR_CUES } from "./editorCues";

// Frame thresholds for the compressed editor beat used by the 23s
// short-cut ad (WapiAdShort) — reconstructs the same cut structure the
// user's own fast edit landed on (reference video), but driven from
// scratch by the real director/DOM logic in editor-director.js, not a
// re-encode of already-rendered footage. Scene-local: 0 is the start of
// this scene's own Sequence (330 frames / 11s total).
//
// The reference skips the promo-banner (bottom banner) upload entirely —
// that cue is pushed past the scene's own length so the
// `if (frame >= cues.promoBannerUpload)` block in the director never
// fires; everything else about the director is untouched.
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
  // Cut straight to "already uploaded" rather than showing the upload
  // itself settle — matches the reference's own fast-cut style.
  portadaUpload: 150,
  promoBannerUpload: NEVER,
  // Product modal: photo already picked, each field typed fast with
  // barely a beat between them, saved, catalog reveal.
  openModal: 195,
  pickImage: 196,
  nameStart: 200,
  nameDone: 230,
  priceStart: 235,
  priceDone: 255,
  descStart: 258,
  descDone: 300,
  category: 302,
  saved: 308,
  bulkLoad: 315,
  // Not shown in this cut at all.
  colorsOpen: NEVER,
  colorsPanelClose: NEVER,
  colorsHoldFirst: 30,
  colorsStepFrames: 90,
  colorsTransitionFrames: 30,
};
