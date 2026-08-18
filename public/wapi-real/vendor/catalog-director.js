// Spliced into the SAME <script> block as catalogo_v28.html's real code
// (see scripts/patch-wapi-html.mjs), right before that block's closing
// tag — so this still runs synchronously during the page's initial script
// execution, before any `await`-ed data fetch ever resumes.
//
// Blocking the carousel from React, reactively, after <iframe onLoad>
// (the previous approach) races the real setInterval(_nextPortada, 3000):
// that timer gets scheduled as soon as the app's own init script runs,
// independent of how long the portada images take to finish loading —
// and `onLoad` only fires once EVERY resource (including those images) has
// loaded. Under real rendering load that can exceed 3s, so the real timer
// could already tick once before the reactive block landed.
//
// Doing it here instead removes the race entirely: this statement runs at
// the tail of the same synchronous script block, which is always still
// executing at time zero — well before the async data-fetch chain that
// eventually calls renderPortadas()/schedules the real timer even resumes.
// `_goPortada` is a top-level `function` declaration, hoisted, so it's
// already bound by the time this line runs regardless of source order.
if (typeof _goPortada === "function") {
  window.__realGoPortada = _goPortada;
  _goPortada = function () {};
}
