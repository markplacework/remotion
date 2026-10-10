// Wave Music · PERSONALIZADO
// The options of the "Personalizado" style (its draw lives in presets.js):
// typeface, colours, effect, animation, background, particles and extras.
// Any other style can be the starting point ("Personalizar este estilo"),
// and a look can be saved as one of the user's own templates.
(function (WM) {
  const DEFAULTS = {
    font: "montserrat",
    upper: true,
    size: 100,
    spacing: 0,
    lineHeight: 1.15,
    align: "center",
    pos: "center",
    color: "#ffffff",
    accent: "#ffd23f",
    effect: "shadow",
    effectColor: "#000000",
    anim: "rise",
    beat: true,
    next: false,
    keyword: false,
    dim: true,
    bg: "animated",
    bg1: "#0d0b1a",
    bg2: "#5b2bd6",
    darken: 35,
    vignette: true,
    fx: "none",
    fxAmount: 80,
    showMeta: false,
    progress: false,
    handle: "",
    handleSize: 100,
  };
  // Personalizado's own original look (its card, "Restaurar estilo")
  const ORIGINAL = { font: "montserrat", effect: "glow", anim: "words", bg: "solid", bg1: "#0d0b1a", fx: "golddust", pos: "top", showMeta: true, progress: true, handle: "Wave Music", handleSize: 130 };
  // the weight each typeface looks best in (and that is self-hosted)
  const WEIGHTS = { anton: 400, montserrat: 800, poppins: 900, inter: 800, league: 400, barlow: 700, bodoni: 600, cormorant: 600, instrument: 400, orbitron: 900, shrikhand: 400, vt323: 400, hand: 400, caveat: 600 };

  // Ready looks to start from
  // Ready looks to start from: the lyric's look only (typeface, colours,
  // text effect, animation); the background and effects stay as they are
  const STARTERS = [
    { name: "Clásico", cfg: {} },
    { name: "Neón", cfg: { font: "orbitron", color: "#ff4fd8", accent: "#22e4ff", effect: "glow", anim: "pop", size: 90 } },
    { name: "Karaoke", cfg: { font: "poppins", color: "#ffffff", accent: "#22d3f5", effect: "outline", effectColor: "#0a0a14", anim: "karaoke", next: true } },
    { name: "Minimal", cfg: { font: "instrument", upper: false, color: "#ffffff", accent: "#ffffff", effect: "none", anim: "fade", beat: false, size: 110 } },
    { name: "Cine", cfg: { font: "cormorant", upper: false, color: "#f3eee4", accent: "#e9c46a", effect: "shadow", anim: "fade", beat: false, size: 105, spacing: 1 } },
    { name: "Marcador", cfg: { font: "poppins", color: "#ffffff", accent: "#ffe600", effect: "marker", effectColor: "#111111", anim: "words" } },
    { name: "Manuscrita", cfg: { font: "hand", upper: false, color: "#ffffff", accent: "#ffffff", effect: "shadow", anim: "typewriter", beat: false, size: 80 } },
    { name: "Sueño", cfg: { font: "montserrat", upper: false, color: "#ffffff", accent: "#ffb3d9", effect: "glow", anim: "words", beat: false } },
  ];
  // what a ready look leaves alone: the background, its effect and the positions
  const SCENE = ["bg", "bg1", "bg2", "darken", "vignette", "fx", "fxAmount", "offText", "offPlayer", "offMeta", "offHandle", "showMeta", "progress", "handle"];


  // Each style as a starting point for Personalizado (the closest look)
  const BASES = {
    kinetic: { font: "anton", accent: "#ffe14d", effect: "none", anim: "pop", bg: "animated", bg1: "#08080c", bg2: "#3a0f2a", size: 115 },
    cinematic: { font: "cormorant", upper: false, color: "#f3eee4", accent: "#e9c46a", effect: "shadow", anim: "fade", beat: false, bg: "media", darken: 40, size: 105 },
    neon: { font: "orbitron", color: "#ff4fd8", accent: "#22e4ff", effect: "glow", anim: "pop", bg: "animated", bg1: "#07010f", bg2: "#2b0a55", fx: "none", size: 88 },
    diario: { font: "bodoni", upper: false, color: "#16130f", accent: "#b8262c", effect: "none", anim: "words", beat: false, bg: "solid", bg1: "#ece5d5", vignette: true, align: "left", size: 105 },
    minimal: { font: "hand", upper: false, color: "#1f2d66", accent: "#1f2d66", effect: "none", anim: "typewriter", beat: false, bg: "solid", bg1: "#f4eddd", vignette: true, align: "left", size: 70 },
    karaoke: { font: "montserrat", color: "#ffffff", accent: "#ffd23f", effect: "outline", effectColor: "#0b0b16", anim: "karaoke", bg: "media", darken: 40, next: true },
    notes: { font: "inter", upper: false, color: "#1d1d1f", accent: "#e8a400", effect: "none", anim: "words", beat: false, bg: "solid", bg1: "#fffaf0", vignette: false, align: "left", pos: "top", size: 80 },
    aurora: { font: "inter", upper: false, color: "#ffffff", accent: "#7df9c4", effect: "glow", anim: "rise", bg: "media", darken: 30, fx: "stars" },
    couture: { font: "bodoni", color: "#ffffff", accent: "#ffffff", effect: "none", anim: "fade", beat: false, bg: "media", darken: 30, spacing: 4, size: 95 },
    blackout: { font: "league", color: "#ffffff", accent: "#ff2d2d", effect: "none", anim: "words", bg: "solid", bg1: "#000000", vignette: false, size: 140 },
    vhs: { font: "vt323", color: "#f2f2f2", accent: "#ff4fd8", effect: "glow", anim: "typewriter", bg: "media", darken: 35, size: 120 },
    vinilo: { font: "instrument", upper: false, color: "#f6e7c8", accent: "#ff9a3c", effect: "shadow", anim: "fade", beat: false, bg: "gradient", bg1: "#1a0e08", bg2: "#5a2a12", fx: "bokeh" },
    adrenalina: { font: "barlow", color: "#ffffff", accent: "#ff3b1f", effect: "shadow", anim: "pop", bg: "media", darken: 15, size: 120 },
    street: { font: "poppins", color: "#ffffff", accent: "#b8ff4d", effect: "box", effectColor: "#000000", anim: "bounce", bg: "media", darken: 15 },
    broadcast: { font: "barlow", color: "#ffffff", accent: "#ffd400", effect: "box", effectColor: "#0b2a6b", anim: "rise", bg: "media", darken: 0, pos: "bottom", align: "left", showMeta: true },
    recorte: { font: "anton", color: "#ffffff", accent: "#ff4d8d", effect: "outline", anim: "pop", bg: "media", darken: 25, size: 125 },
    lluvia: { font: "montserrat", upper: false, color: "#e9f1ff", accent: "#8cc7ff", effect: "shadow", anim: "fade", bg: "media", darken: 35, fx: "rain", beat: false },
    nieve: { font: "cormorant", upper: false, color: "#ffffff", accent: "#cfe8ff", effect: "glow", anim: "fade", bg: "media", darken: 25, fx: "snow", beat: false },
    tormenta: { font: "league", color: "#eaf2ff", accent: "#9ecbff", effect: "glow", anim: "pop", bg: "media", darken: 40, fx: "lightning", size: 130 },
    otono: { font: "cormorant", upper: false, color: "#fff4e6", accent: "#ff9a3c", effect: "shadow", anim: "rise", bg: "media", darken: 30, beat: false, fx: "leak", fxAmount: 60 },
    live: { font: "montserrat", color: "#ffffff", accent: "#ff2d55", effect: "box", effectColor: "#000000", anim: "words", bg: "media", darken: 0, pos: "bottom" },
    noticiero: { font: "montserrat", color: "#ffffff", accent: "#ffd400", effect: "box", effectColor: "#b3001b", anim: "rise", bg: "media", darken: 0, pos: "bottom", align: "left" },
    radio: { font: "montserrat", color: "#ffffff", accent: "#ff9500", effect: "shadow", anim: "words", bg: "media", darken: 30, showMeta: true },
    stream: { font: "poppins", color: "#ffffff", accent: "#9146ff", effect: "box", effectColor: "#9146ff", anim: "words", bg: "media", darken: 0, pos: "bottom" },
    karasing: { font: "poppins", color: "#ffffff", accent: "#ff3d8b", effect: "outline", effectColor: "#14001f", anim: "karaoke", bg: "animated", bg1: "#14001f", bg2: "#ff3d8b", next: true },
    kararetro: { font: "barlow", color: "#ffffff", accent: "#ffe600", effect: "outline", effectColor: "#1a0033", anim: "karaoke", bg: "gradient", bg1: "#1a0033", bg2: "#ff2fa0", next: true },
    karastage: { font: "poppins", color: "#ffffff", accent: "#ffd23f", effect: "glow", anim: "karaoke", bg: "animated", bg1: "#070712", bg2: "#3a2a7a", fx: "golddust", next: true },
  };

  const KEY_CUR = "wm-custom-cur";
  const KEY_TPL = "wm-custom-tpls";
  const KEY_ORIGIN = "wm-custom-origin";
  const KEY_ACTIVE = "wm-custom-active";
  /** A look as text, keys sorted (to compare two of them). */
  const same = (o) =>
    JSON.stringify(
      Object.keys(o)
        .filter((k) => o[k] != null)
        .sort()
        .map((k) => [k, o[k]])
    );
  /** Older saves had "particles"; now there is one effect slot. */
  function migrate(c) {
    c = { ...DEFAULTS, ...c };
    if (c.particles && c.particles !== "none" && (!c.fx || c.fx === "none")) c.fx = c.particles;
    if (c.fx === "sparkles") c.fx = "stars"; // "Brillos" is gone
    if (c.fx === "confetti") c.fx = "none";
    delete c.particles;
    return c;
  }
  const read = (k, d) => {
    try {
      const v = JSON.parse(localStorage.getItem(k));
      return v == null ? d : v;
    } catch {
      return d;
    }
  };
  const write = (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      /* private mode: kept for this visit only */
    }
  };

  // once: the ready looks ("Para empezar") are gone, so a look left over
  // from them goes back to Personalizado's own (saved templates stay)
  if (read("wm-custom-v", 0) < 4) {
    write(KEY_CUR, ORIGINAL);
    write(KEY_ORIGIN, ORIGINAL);
    write(KEY_ACTIVE, null);
    write("wm-custom-v", 4);
  }
  const api = {
    DEFAULTS,
    STARTERS,
    BASES,
    SCENE,
    ORIGINAL,
    cfg: migrate(read(KEY_CUR, ORIGINAL)),
    // the look it started from ("Restaurar estilo" goes back to it)
    origin: read(KEY_ORIGIN, {}),
    familyOf(id) {
      const f = WM.Presets && WM.Presets.FONTS.find((x) => x.id === id);
      return f ? f.family : "Montserrat, sans-serif";
    },
    weightOf: (id) => WEIGHTS[id] || 800,
    /** Change some options (and remember them). */
    set(patch) {
      Object.assign(api.cfg, patch);
      write(KEY_CUR, api.cfg);
    },
    /** Start over from a look: the defaults plus its own choices. */
    apply(patch, template = null, origin = patch) {
      api.cfg = migrate(JSON.parse(JSON.stringify(patch)));
      // "Restaurar estilo" goes back here: the clean look, not what it was layered on
      api.origin = JSON.parse(JSON.stringify(origin));
      api.active = template;
      write(KEY_CUR, api.cfg);
      write(KEY_ORIGIN, api.origin);
      write(KEY_ACTIVE, api.active);
    },
    /** Put back an exact earlier state (undo/redo), keeping where it started from. */
    replace(cfg, active) {
      api.cfg = JSON.parse(JSON.stringify(cfg));
      api.active = active;
      write(KEY_CUR, api.cfg);
      write(KEY_ACTIVE, active);
    },
    /** Chosen straight from its card: "Restaurar estilo" means its own original look. */
    fromScratch() {
      if (api.active) return;
      api.origin = { ...ORIGINAL };
      write(KEY_ORIGIN, api.origin);
    },
    /** Back to the look it started from (a saved template: as it was saved). */
    restore() {
      api.apply(Object.keys(api.origin || {}).length ? api.origin : ORIGINAL, api.active);
    },
    // the user's template being edited (null: a ready look or a style)
    active: read(KEY_ACTIVE, null),
    templates: () => read(KEY_TPL, []),
    /** Save the current look under a name (replacing one with that name, in place). */
    saveTemplate(name) {
      const list = api.templates();
      const item = { name, cfg: JSON.parse(JSON.stringify(api.cfg)) };
      const i = list.findIndex((x) => x.name === name);
      if (i >= 0) list[i] = item;
      else list.push(item);
      write(KEY_TPL, list);
      api.origin = JSON.parse(JSON.stringify(api.cfg));
      api.active = name;
      write(KEY_ORIGIN, api.origin);
      write(KEY_ACTIVE, name);
    },
    /** Whether the template being edited has unsaved changes. */
    get dirty() {
      const t = api.active && api.templates().find((x) => x.name === api.active);
      return !!t && same(migrate(t.cfg)) !== same(api.cfg);
    },
    deleteTemplate(name) {
      write(
        KEY_TPL,
        api.templates().filter((x) => x.name !== name)
      );
      if (api.active === name) {
        api.active = null;
        write(KEY_ACTIVE, null);
      }
    },
  };
  WM.Custom = api;
})((window.WaveMusic = window.WaveMusic || {}));
