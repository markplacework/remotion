// Wave Music · ESTILOS
// Visual styles for the lyric video. Every style uses the same audio,
// lyrics, timestamps and sync; only the look changes:
//
//   kind "chat"   — lyrics as messages (WhatsApp, Instagram, Messenger)
//   kind "lyrics" — a music-player lyrics screen (Spotify)
//
// Colours were sampled from the apps' own dark-mode screenshots.
(function (WM) {
  const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  const LYRICS_FONT = '"Figtree", "Montserrat", ' + FONT_STACK;

  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const rgb = (c) => `rgb(${c.map((v) => Math.round(v)).join(",")})`;

  /** Colour of a vertical gradient (stops: [[pos 0..1, "#rrggbb"], ...]) at pos. */
  function gradientAt(stops, pos) {
    const p = Math.max(0, Math.min(1, pos));
    for (let i = 1; i < stops.length; i++) {
      if (p <= stops[i][0]) {
        const [p0, c0] = stops[i - 1];
        const [p1, c1] = stops[i];
        const k = p1 === p0 ? 0 : (p - p0) / (p1 - p0);
        const a = hex(c0);
        const b = hex(c1);
        return rgb(a.map((v, j) => v + (b[j] - v) * k));
      }
    }
    return stops[stops.length - 1][1];
  }

  function hsl(h, s, l) {
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  // Spotify-style palettes: one hue, the lightness and saturation are
  // fixed, so every choice keeps white text readable and the inactive
  // lines a light tint of the same colour (as in the real app:
  // bg hsl(0,93%,21%) -> hsl(5,59%,35%), lines hsl(4,88%,84%)).
  const SPOTIFY_COLORS = [
    { id: "rojo", label: "Rojo", h: 2, s: 1 },
    { id: "naranja", label: "Naranja", h: 20, s: 1 },
    { id: "mostaza", label: "Mostaza", h: 40, s: 0.9 },
    { id: "verde", label: "Verde", h: 145, s: 0.75 },
    { id: "turquesa", label: "Turquesa", h: 180, s: 0.8 },
    { id: "azul", label: "Azul", h: 215, s: 0.9 },
    { id: "violeta", label: "Violeta", h: 265, s: 0.8 },
    { id: "rosa", label: "Rosa", h: 330, s: 0.85 },
    { id: "grafito", label: "Grafito", h: 220, s: 0.08 },
  ];

  function spotifyPalette(colorId) {
    const c = SPOTIFY_COLORS.find((x) => x.id === colorId) || SPOTIFY_COLORS[0];
    const top = [c.h, 93 * c.s, 21];
    const bottom = [c.h + 4, 59 * c.s, 35];
    return {
      id: c.id,
      bgTop: hsl(c.h, Math.round(93 * c.s), 21),
      bgBottom: hsl(c.h + 4, Math.round(59 * c.s), 35),
      /** Background colour at vertical position pos (0 top .. 1 bottom). */
      at: (pos, alpha = 1) => {
        const k = Math.max(0, Math.min(1, pos));
        const [h, s, l] = top.map((v, i) => v + (bottom[i] - v) * k);
        return `hsla(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%, ${alpha})`;
      },
      line: hsl(c.h + 3, Math.round(88 * c.s), 84),
      swatch: hsl(c.h, Math.round(80 * c.s), 38),
    };
  }

  const THEMES = {
    whatsapp: {
      id: "whatsapp",
      label: "WhatsApp",
      pro: true,
      kind: "chat",
      background: { type: "wallpaper" },
      bubble: "whatsapp", // DarkChatLog port (bubbles.js)
      mockup: "baked", // the WhatsApp mockup PNG already has the app UI
    },
    instagram: {
      id: "instagram",
      label: "Instagram",
      pro: true,
      kind: "chat",
      background: { type: "solid", color: "#000000" },
      bubble: "flat",
      flat: {
        // The outgoing gradient is fixed to the screen: magenta at the
        // top, violet in the middle, blue at the bottom.
        stops: [
          [0.0, "#cc06cb"],
          [0.45, "#7f33f5"],
          [1.0, "#4f5bf9"],
        ],
        text: "#ffffff",
        radius: 24,
        tight: 5, // corner between bubbles of the same group
        gap: 4,
        fontSize: 21,
        padding: "12px 17px",
      },
      mockup: "chrome",
    },
    messenger: {
      id: "messenger",
      label: "Messenger",
      pro: true,
      kind: "chat",
      background: { type: "solid", color: "#000000" },
      bubble: "flat",
      flat: {
        stops: [
          [0.0, "#1270ff"],
          [1.0, "#3a62ff"],
        ],
        text: "#ffffff",
        radius: 22,
        tight: 5,
        gap: 4,
        fontSize: 21,
        padding: "11px 16px",
      },
      mockup: "chrome",
    },
    spotify: {
      id: "spotify",
      label: "Spotify",
      pro: true,
      kind: "lyrics",
      background: { type: "palette" },
      mockup: "chrome",
      lyrics: { fontSize: 22, lineHeight: 1.22, gap: 20, activeScale: 1.06 },
    },
    // ---- Lyrics Pro: full-screen motion presets (presets.js) ----
    kinetic: { id: "kinetic", label: "Kinetic Bold", kind: "motion", preset: "kinetic", background: { type: "motion" }, video: true },
    cinematic: { id: "cinematic", label: "Cinematic", kind: "motion", preset: "cinematic", background: { type: "motion" }, meta: true, video: true },
    neon: { id: "neon", label: "Neon Cyber", kind: "motion", preset: "neon", background: { type: "motion" } },
    minimal: { id: "minimal", label: "Minimal", kind: "motion", preset: "minimal", background: { type: "motion" }, statusInk: "#16140f", meta: true },
    karaoke: { id: "karaoke", label: "Karaoke", kind: "motion", preset: "karaoke", background: { type: "motion" }, video: true },
    wordpop: { id: "wordpop", label: "Word Pop", kind: "motion", preset: "wordpop", background: { type: "motion" } },
    // Saved, not shown: chrome: { id: "chrome", label: "Chrome", kind: "motion", preset: "chrome", background: { type: "motion" }, video: true },
    notes: { id: "notes", label: "Notas", kind: "motion", preset: "notes", background: { type: "motion" }, meta: true },
    aurora: { id: "aurora", label: "Aurora", kind: "motion", preset: "aurora", background: { type: "motion" }, meta: true, video: true },
    couture: { id: "couture", label: "Couture", kind: "motion", preset: "couture", background: { type: "motion" }, video: true },
    blackout: { id: "blackout", label: "Blackout", kind: "motion", preset: "blackout", background: { type: "motion" } },
    vhs: { id: "vhs", label: "VHS", kind: "motion", preset: "vhs", background: { type: "motion" }, video: true },
    vinilo: { id: "vinilo", label: "Vinilo", kind: "motion", preset: "vinilo", background: { type: "motion" }, meta: true },
    // extreme sports (they suit action footage: the sample clip included)
    adrenalina: { id: "adrenalina", label: "Adrenalina", kind: "motion", preset: "adrenalina", background: { type: "motion" }, video: true },
    street: { id: "street", label: "Street", kind: "motion", preset: "street", background: { type: "motion" }, video: true },
    broadcast: { id: "broadcast", label: "Broadcast", kind: "motion", preset: "broadcast", background: { type: "motion" }, meta: true, video: true },
    recorte: { id: "recorte", label: "Recorte", kind: "motion", preset: "recorte", background: { type: "motion" }, video: true },
    // weather
    lluvia: { id: "lluvia", label: "Lluvia", kind: "motion", preset: "lluvia", background: { type: "motion" }, video: true },
    nieve: { id: "nieve", label: "Nieve", kind: "motion", preset: "nieve", background: { type: "motion" }, video: true },
    tormenta: { id: "tormenta", label: "Tormenta", kind: "motion", preset: "tormenta", background: { type: "motion" }, video: true },
    otono: { id: "otono", label: "Otoño", kind: "motion", preset: "otono", background: { type: "motion" }, video: true },
    // live broadcasts
    live: { id: "live", label: "Live", kind: "motion", preset: "live", background: { type: "motion" }, meta: true, video: true },
    noticiero: { id: "noticiero", label: "Noticiero", kind: "motion", preset: "noticiero", background: { type: "motion" }, meta: true, video: true },
    radio: { id: "radio", label: "Radio", kind: "motion", preset: "radio", background: { type: "motion" }, meta: true, video: true },
    stream: { id: "stream", label: "Stream", kind: "motion", preset: "stream", background: { type: "motion" }, video: true },
    // only in the Karaoke tool
    karasing: { id: "karasing", label: "Sing", kind: "motion", preset: "karasing", background: { type: "motion" }, karaokeOnly: true },
    kararetro: { id: "kararetro", label: "Karaoke 80s", kind: "motion", preset: "kararetro", background: { type: "motion" }, meta: true, karaokeOnly: true },
    karastage: { id: "karastage", label: "Escenario", kind: "motion", preset: "karastage", background: { type: "motion" }, karaokeOnly: true },
  };

  WM.Themes = {
    list: Object.values(THEMES),
    get: (id) => THEMES[id] || THEMES.whatsapp,
    gradientAt,
    spotifyPalette,
    SPOTIFY_COLORS,
    FONT_STACK,
    LYRICS_FONT,
  };
})((window.WaveMusic = window.WaveMusic || {}));
