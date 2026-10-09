// Wave Music · EFECTOS REALISTAS
// Real footage of snow, fog, smoke, embers, light… shot over black and
// blended with "screen" on top of the background, the way editors use
// overlay packs. The clips (Pixabay, cropped to 720x1280 and made to loop
// seamlessly) are served by the media service; rain is drawn instead.
// Like the background video, the clip follows the song's clock, so the
// preview, seeking and the export show the same frame.
(function (WM) {
  const LIST = [
    { id: "none", label: "Ninguno" },
    { id: "snow", label: "Nieve" },
    { id: "rain", label: "Lluvia", drawn: true },
    { id: "fog", label: "Niebla" },
    { id: "smoke", label: "Humo" },
    { id: "lightning", label: "Relámpagos" },
    { id: "embers", label: "Brasas" },
    { id: "sparks", label: "Chispas" },
    { id: "bokeh", label: "Bokeh" },
    { id: "golddust", label: "Polvo dorado" },
    { id: "rays", label: "Rayos de luz" },
    { id: "leak", label: "Luz cálida" },
    { id: "flare", label: "Destello" },
  ];

  const el = document.createElement("video");
  el.muted = true;
  el.loop = true;
  el.playsInline = true;
  el.preload = "auto";
  const blobs = new Map(); // id -> object URL (kept: switching back is instant)
  let loaded = ""; // id whose clip is in the element
  let loading = null;

  const api = {
    LIST,
    el,
    // the choice for the styles with a background video (Personalizado keeps its own)
    current: { id: "none", amount: 80 },
    exporting: false,
    onchange: null,
    /** Make sure the clip for an effect is in the element. */
    load(id) {
      const fx = LIST.find((x) => x.id === id);
      if (!fx || fx.drawn || id === "none" || loaded === id) return loading || Promise.resolve();
      loaded = id;
      loading = (async () => {
        try {
          let url = blobs.get(id);
          if (!url) {
            const res = await fetch(`${WM.ModalSync.mediaUrl()}/sample/fx${id}.mp4`);
            if (!res.ok) throw new Error("No se pudo cargar el efecto");
            url = URL.createObjectURL(await res.blob());
            blobs.set(id, url);
          }
          if (loaded !== id) return;
          await new Promise((res, rej) => {
            el.onloadeddata = res;
            el.onerror = () => rej(new Error("No se pudo leer el efecto"));
            el.src = url;
          });
        } catch (e) {
          if (loaded === id) loaded = "";
          throw e;
        } finally {
          loading = null;
          if (api.onchange) api.onchange();
        }
      })();
      return loading;
    },
    /** Resolves once the current clip can be drawn (before an export). */
    ready: () => (loading ? loading.catch(() => {}) : Promise.resolve()),
    get busy() {
      return !!loading;
    },
    /** Keep the clip on the song's clock (called once per drawn frame). */
    sync(t, playing, fromExport = false) {
      if (!loaded || !el.duration) return;
      if (api.exporting && !fromExport) return;
      const d = el.duration;
      const want = ((t % d) + d) % d;
      const drift = Math.abs(el.currentTime - want);
      if (playing) {
        if (el.paused) el.play().catch(() => {});
        if (drift > 0.35 && drift < d - 0.35 && !el.seeking) el.currentTime = want;
      } else {
        if (!el.paused) el.pause();
        if (drift > 0.04 && !el.seeking) el.currentTime = want;
      }
    },
    /** Paint an effect over what is already on the canvas. amount: 0..100 */
    paint(g, W, H, id, amount, t) {
      if (!id || id === "none" || amount <= 0) return;
      const k = Math.min(1, amount / 100);
      if (id === "rain") return rain(g, W, H, t, k);
      api.load(id).catch(() => {});
      if (loaded !== id || el.readyState < 2 || !el.videoWidth) return;
      const vw = el.videoWidth;
      const vh = el.videoHeight;
      const s = Math.max(W / vw, H / vh);
      g.save();
      g.globalCompositeOperation = "screen";
      g.globalAlpha = k;
      g.drawImage(el, (W - vw * s) / 2, (H - vh * s) / 2, vw * s, vh * s);
      g.restore();
    },
  };

  // Rain: three depths of motion-blurred streaks with a little wind; the
  // near ones longer, wider and brighter, like drops passing the lens.
  const rnd = (i) => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const LAYERS = [
    { n: 170, len: 26, w: 1, speed: 1500, a: 0.22 },
    { n: 90, len: 52, w: 1.6, speed: 2300, a: 0.32 },
    { n: 26, len: 110, w: 2.6, speed: 3400, a: 0.4 },
  ];
  function rain(g, W, H, t, k) {
    const s = W / 1080;
    const wind = 0.16;
    g.save();
    g.globalCompositeOperation = "screen";
    g.lineCap = "round";
    // a cool, wet haze over the whole frame
    g.fillStyle = `rgba(120,140,170,${0.07 * k})`;
    g.fillRect(0, 0, W, H);
    LAYERS.forEach((L, li) => {
      g.lineWidth = L.w * s;
      for (let i = 0; i < L.n; i++) {
        const seed = li * 1000 + i;
        const len = L.len * s * (0.7 + rnd(seed) * 0.6);
        const sp = L.speed * s * (0.85 + rnd(seed + 1) * 0.3);
        const span = H + len * 2;
        const y = ((rnd(seed + 2) * span + t * sp) % span) - len;
        const x = ((rnd(seed + 3) * (W + H * wind) - y * wind) % (W + 60 * s)) - 30 * s;
        const grd = g.createLinearGradient(x, y, x - len * wind, y + len);
        const a = L.a * k * (0.6 + rnd(seed + 4) * 0.4);
        grd.addColorStop(0, "rgba(210,225,245,0)");
        grd.addColorStop(1, `rgba(220,232,250,${a})`);
        g.strokeStyle = grd;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x - len * wind, y + len);
        g.stroke();
      }
    });
    g.restore();
  }

  WM.Fx = api;
})((window.WaveMusic = window.WaveMusic || {}));
