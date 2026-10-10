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
  const SAMPLES_VERSION = 8;
  const samples = new Map(); // style -> Promise<Blob>
  let sampleSeq = 0;

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
    img,
    // look applied over the footage (see FILTERS)
    filter: "none",
    /** The bundled sample video. */
    loadSample() {
      return api.load(null, WM.DEMO_BG);
    },
    // the style whose sample is loaded ("" when it is the user's own)
    sample: "",
    /** Whether a style shows the current background. */
    showsIn(theme) {
      return !!theme.video;
    },
    /**
     * Download a style's sample ahead of time (kept for the visit), so
     * choosing the style shows its footage at once.
     */
    prefetch(style) {
      if (!(WM.STYLE_SAMPLES && WM.STYLE_SAMPLES[style])) return Promise.reject(new Error("sin ejemplo"));
      if (!samples.has(style)) {
        // ?v: the clips were replaced once; browsers kept the old ones for a day
        const p = fetch(`${WM.ModalSync.mediaUrl()}/sample/${style}.mp4?v=${SAMPLES_VERSION}`)
          .then((res) => {
            if (!res.ok) throw new Error();
            return res.blob();
          })
          .catch((e) => {
            samples.delete(style);
            throw e;
          });
        samples.set(style, p);
      }
      return samples.get(style);
    },
    /** A style's own sample clip (from the media service), the bundled one if offline. */
    async loadStyleSample(style) {
      const info = WM.STYLE_SAMPLES && WM.STYLE_SAMPLES[style];
      const my = ++sampleSeq;
      if (info) {
        try {
          const blob = await api.prefetch(style);
          // another style was picked while this one downloaded
          if (my !== sampleSeq) return;
          await api.load(new File([blob], `ejemplo-${style}.mp4`, { type: "video/mp4" }));
          api.sample = style;
          api.name = `ejemplo de ${info.user} (Pixabay)`;
          return;
        } catch {
          /* offline: fall back to the bundled clip */
        }
      }
      await api.load(null, WM.DEMO_BG);
      api.sample = style;
    },
    async load(file, sample) {
      api.clear();
      // the user's own file (kept so each style can have its own background)
      api.file = file || null;
      url = file ? URL.createObjectURL(file) : null;
      api.name = file ? file.name : sample.name;
      api.kind = file && /^image\//.test(file.type) ? "image" : "video";
      const src = url || sample.src;
      if (api.kind === "image") {
        img.src = src;
        try {
          await img.decode();
        } catch {
          throw new Error("No se pudo leer esa imagen");
        }
      } else {
        await new Promise((res, rej) => {
          el.onloadeddata = res;
          el.onerror = () => rej(new Error("No se pudo leer ese video"));
          el.src = src;
        });
      }
      api.enabled = true;
    },
    file: null,
    clear() {
      api.enabled = false;
      api.file = null;
      api.sample = "";
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
        // an export seeks every frame exactly; the paused preview tolerates a little
        if (drift > (fromExport ? 0.008 : 0.04) && !el.seeking) el.currentTime = want;
      }
      return api.ready ? el : null;
    },
    /** Whether the footage is still moving to the frame asked for (an export waits). */
    busy() {
      return api.enabled && api.kind !== "image" && !!el.duration && (el.seeking || el.readyState < 2);
    },
  };
  // Filters are colour layers blended over the footage (not canvas
  // filters), so they look the same in every browser, Safari included.
  // CapCut-style looks, as blend layers ([mode, colour, opacity]).
  // "lighten" with a dark colour lifts the blacks: the faded film look.
  const FILTERS = {
    none: { label: "Original", layers: [] },
    cine: { label: "Cine", layers: [["soft-light", "#0f7f8f", 0.55], ["soft-light", "#ff8a3d", 0.22], ["multiply", "#e9e2d8", 0.2]] },
    pelicula: { label: "Película", layers: [["soft-light", "#ffb070", 0.4], ["saturation", "#808080", 0.18], ["lighten", "#261c16", 1]] },
    dorado: { label: "Dorado", layers: [["soft-light", "#ffb347", 0.6], ["screen", "#ff9a3c", 0.07]] },
    moody: { label: "Moody", layers: [["saturation", "#808080", 0.35], ["soft-light", "#23415e", 0.55], ["multiply", "#c8d0dc", 0.4]] },
    noir: { label: "Noir", layers: [["saturation", "#808080", 1], ["soft-light", "#000", 0.6], ["lighten", "#141414", 1]] },
    retro: { label: "Retro 70s", layers: [["saturation", "#808080", 0.3], ["soft-light", "#e8a060", 0.55], ["lighten", "#2e2219", 1], ["multiply", "#f2e2c4", 0.25]] },
    cyber: { label: "Cyber", layers: [["soft-light", "cyber", 0.7], ["screen", "#2a0a4a", 0.25]] },
    pastel: { label: "Pastel", layers: [["saturation", "#808080", 0.3], ["screen", "#ffd6e8", 0.2], ["lighten", "#3a3440", 1]] },
    calido: { label: "Cálido", layers: [["soft-light", "#ff8a2a", 0.6]] },
    frio: { label: "Frío", layers: [["soft-light", "#2a7bff", 0.6]] },
    vintage: { label: "Vintage", layers: [["saturation", "#808080", 0.45], ["soft-light", "#ffb45a", 0.55], ["source-over", "#3a2410", 0.12]] },
    drama: { label: "Dramático", layers: [["soft-light", "#000", 0.55], ["saturation", "#ff2a2a", 0.15]] },
    bn: { label: "B/N", layers: [["saturation", "#808080", 1], ["soft-light", "#000", 0.25]] },
    oscuro: { label: "Oscuro", layers: [["source-over", "#000", 0.45]] },
    duotono: { label: "Duotono", layers: [["color", "duo", 0.75]] },
  };
  api.FILTERS = FILTERS;
  // how strongly the filter is applied, 0..1
  api.filterAmount = 1;
  const GRADIENTS = {
    duo: ["#ff2d95", "#2d6bff"],
    cyber: ["#ff2bd6", "#22e4ff"],
  };
  /** Paint a filter (the chosen one by default) over a frame of footage. */
  api.paintFilter = (g, W, H, id = api.filter, amount = api.filterAmount) => {
    const fl = FILTERS[id];
    if (!fl || !fl.layers.length || amount <= 0) return;
    g.save();
    fl.layers.forEach(([op, col, a]) => {
      // a black-lifting "lighten" scales by darkening its colour instead
      if (op === "lighten") {
        const n = parseInt(col.slice(1), 16);
        const k = Math.min(1, amount);
        g.globalCompositeOperation = op;
        g.globalAlpha = 1;
        g.fillStyle = `rgb(${((n >> 16) & 255) * k},${((n >> 8) & 255) * k},${(n & 255) * k})`;
        g.fillRect(0, 0, W, H);
        return;
      }
      g.globalCompositeOperation = op;
      g.globalAlpha = a * Math.min(1, amount);
      if (GRADIENTS[col]) {
        const gr = g.createLinearGradient(0, 0, W, H);
        gr.addColorStop(0, GRADIENTS[col][0]);
        gr.addColorStop(1, GRADIENTS[col][1]);
        g.fillStyle = gr;
      } else g.fillStyle = col;
      g.fillRect(0, 0, W, H);
    });
    g.restore();
  };
  WM.BgVideo = api;
})((window.WaveMusic = window.WaveMusic || {}));
