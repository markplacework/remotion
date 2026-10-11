// Wave Music · FONDO PROPIO (video o imagen)
// A user's own (vertical) video behind the Lyrics Pro styles that take
// one. It loops and follows the song's clock: the audio stays the master,
// the video is nudged back whenever it drifts, so preview, seeking and the
// export all show the same frame for the same moment.
(function (WM) {
  const el = document.createElement("video");
  el.muted = true;
  el.loop = true;
  el.playsInline = true;
  el.preload = "auto";
  const img = new Image();
  let url = null;

  const api = {
    el,
    name: "",
    kind: "video", // or "image"
    enabled: false,
    // while a download is being recorded the export owns the clock
    exporting: false,
    get ready() {
      if (api.kind === "image") return api.enabled && img.complete && img.naturalWidth > 0;
      return api.enabled && el.readyState >= 2 && el.videoWidth > 0;
    },
    async load(file) {
      api.clear();
      url = URL.createObjectURL(file);
      api.name = file.name;
      api.kind = /^image\//.test(file.type) ? "image" : "video";
      if (api.kind === "image") {
        img.src = url;
        try {
          await img.decode();
        } catch {
          throw new Error("No se pudo leer esa imagen");
        }
      } else {
        await new Promise((res, rej) => {
          el.onloadeddata = res;
          el.onerror = () => rej(new Error("No se pudo leer ese video"));
          el.src = url;
        });
      }
      api.enabled = true;
    },
    clear() {
      api.enabled = false;
      api.name = "";
      el.pause();
      el.removeAttribute("src");
      el.load();
      if (url) URL.revokeObjectURL(url);
      url = null;
    },
    /** Keep the video on the song's clock; the element when it can be drawn. */
    at(t, playing, fromExport = false) {
      if (api.kind === "image") return api.ready ? img : null;
      if (!api.enabled || !el.duration) return null;
      if (api.exporting && !fromExport) return api.ready ? el : null;
      const d = el.duration;
      const want = ((t % d) + d) % d;
      const drift = Math.abs(el.currentTime - want);
      const off = drift > 0.35 && drift < d - 0.35;
      if (playing) {
        if (el.paused) el.play().catch(() => {});
        if (off && !el.seeking) el.currentTime = want;
      } else {
        if (!el.paused) el.pause();
        if (drift > 0.04 && !el.seeking) el.currentTime = want;
      }
      return api.ready ? el : null;
    },
  };
  WM.BgVideo = api;
})((window.WaveMusic = window.WaveMusic || {}));
