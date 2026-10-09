// Wave Music · EFECTOS REALISTAS
// Real footage of snow, fog, smoke, embers, light… shot over black and
// blended with "screen" on top of the background, the way editors use
// overlay packs. The clips (Pixabay, cropped to 720x1280 and made to loop
// seamlessly) are served by the media service; rain and lightning are drawn.
// Like the background video, the clip follows the song's clock, so the
// preview, seeking and the export show the same frame.
(function (WM) {
  const LIST = [
    { id: "none", label: "Ninguno" },
    { id: "snow", label: "Nieve" },
    { id: "rain", label: "Lluvia", drawn: true },
    { id: "fog", label: "Niebla" },
    { id: "smoke", label: "Humo" },
    { id: "lightning", label: "Relámpagos", drawn: true },
    { id: "fire", label: "Fuego" },
    { id: "embers", label: "Brasas" },
    { id: "sparks", label: "Chispas" },
    { id: "bokeh", label: "Bokeh" },
    { id: "golddust", label: "Polvo dorado" },
    { id: "rays", label: "Rayos de luz" },
    { id: "leak", label: "Luz cálida" },
    { id: "flare", label: "Destello" },
  ];

  // one element per effect, so styles and previews never fight over a clip
  const clips = new Map(); // id -> { el, loading, used }
  const pending = new Set();

  const api = {
    LIST,
    // the choice for the styles with a background video (Personalizado keeps its own)
    current: { id: "none", amount: 80 },
    exporting: false,
    // thumbnails run on their own clock: they get the drawn effects only
    quiet: false,
    onchange: null,
    /** Make sure the clip for an effect is loaded. */
    load(id) {
      const fx = LIST.find((x) => x.id === id);
      if (!fx || fx.drawn || id === "none") return Promise.resolve();
      let c = clips.get(id);
      if (c) return c.loading || Promise.resolve();
      const el = document.createElement("video");
      el.muted = true;
      el.loop = true;
      el.playsInline = true;
      el.preload = "auto";
      c = { el, used: 0, loading: null };
      clips.set(id, c);
      c.loading = (async () => {
        try {
          const res = await fetch(`${WM.ModalSync.mediaUrl()}/sample/fx${id}.mp4?v=1`);
          if (!res.ok) throw new Error("No se pudo cargar el efecto");
          const url = URL.createObjectURL(await res.blob());
          await new Promise((ok, fail) => {
            el.onloadeddata = ok;
            el.onerror = () => fail(new Error("No se pudo leer el efecto"));
            el.src = url;
          });
        } catch (e) {
          clips.delete(id); // try again next time
          throw e;
        } finally {
          c.loading = null;
          pending.delete(c);
          if (api.onchange) api.onchange();
        }
      })();
      pending.add(c);
      return c.loading;
    },
    /** Resolves once every clip being loaded can be drawn (before an export). */
    ready: () => Promise.all([...pending].map((c) => c.loading && c.loading.catch(() => {}))),
    /** Keep the clips in use on the song's clock (once per drawn frame). */
    sync(t, playing, fromExport = false) {
      if (api.exporting && !fromExport) return;
      const now = performance.now();
      clips.forEach((c) => {
        const el = c.el;
        if (!el.duration) return;
        // a clip no style drew lately rests
        if (now - c.used > 800) {
          if (!el.paused) el.pause();
          return;
        }
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
      });
    },
    /**
     * Paint an effect over what is already on the canvas. amount: 0..100;
     * pulse: the beat (lightning strikes on it). Returns whether it painted.
     */
    paint(g, W, H, id, amount, t, pulse = 0) {
      if (!id || id === "none" || amount <= 0) return false;
      const k = Math.min(1, amount / 100);
      if (id === "rain") return rain(g, W, H, t, k), true;
      if (id === "lightning") return lightning(g, W, H, t, k, pulse), true;
      if (api.quiet) return false;
      api.load(id).catch(() => {});
      const c = clips.get(id);
      if (!c || c.loading || c.el.readyState < 2 || !c.el.videoWidth) return false;
      c.used = performance.now();
      const el = c.el;
      const vw = el.videoWidth;
      const vh = el.videoHeight;
      const s = Math.max(W / vw, H / vh);
      g.save();
      g.globalCompositeOperation = "screen";
      g.globalAlpha = k;
      g.drawImage(el, (W - vw * s) / 2, (H - vh * s) / 2, vw * s, vh * s);
      g.restore();
      return true;
    },
  };

  // Lightning (as in the Tormenta style): a fresh bolt on every strong beat
  function lightning(g, W, H, t, k, pulse) {
    const flash = pulse > 0.72 ? (pulse - 0.72) / 0.28 : 0;
    if (flash <= 0.05) return;
    const u = W / 1100;
    const rnd2 = (i) => {
      const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    g.save();
    g.fillStyle = `rgba(200,210,255,${0.35 * flash * k})`;
    g.fillRect(0, 0, W, H);
    const seed = Math.floor(t * 3);
    let x = W * (0.2 + rnd2(seed) * 0.6);
    let y = 0;
    g.strokeStyle = `rgba(240,245,255,${flash * k})`;
    g.shadowColor = "rgba(170,190,255,1)";
    g.shadowBlur = u * 30;
    g.lineWidth = u * 4;
    g.lineJoin = "round";
    g.beginPath();
    g.moveTo(x, y);
    for (let i = 0; i < 12 && y < H * 0.62; i++) {
      x += (rnd2(seed * 7 + i) - 0.5) * u * 120;
      y += H * (0.04 + rnd2(seed * 3 + i) * 0.03);
      g.lineTo(x, y);
    }
    g.stroke();
    g.restore();
  }

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
