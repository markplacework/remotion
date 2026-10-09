// Wave Music · COMENTARIOS DEL LIVE
// The Live and Stream styles show viewers' comments. They are written by
// AI from one frame of the background and the song's lyrics (our media
// service asks OpenAI), can be edited by hand, and fall back to themed
// lists when there is no AI at hand. The presets read WM.LiveChat.list.
(function (WM) {
  const NAMES = ["sofi.music", "juanpi_22", "lu.martinez", "tomas.rk", "cami_fan", "nico.beats", "valen.ok", "agus_m", "flor.canta", "mateo.lp", "rocio_x", "lean.dj", "meli.ok", "santi_07", "bren.music", "fede.rk"];
  // themed comments for when there is no AI (picked from the background's name/search)
  const THEMES = {
    nieve: ["qué lugar hermoso 😍", "¿dónde es eso?", "esa nieve 🔥", "quiero estar ahí", "bariloche??", "qué frío jaja", "vista increíble"],
    playa: ["qué playa 😍", "¿dónde es?", "me voy ya", "ese mar 🌊", "verano ya", "qué lugar"],
    ciudad: ["qué buena noche", "¿qué ciudad es?", "esas luces 😍", "vibes nocturnas", "la ciudad no duerme"],
    recital: ["quiero ir al próximo show", "qué energía!!", "ese público 🔥", "estuve ahí!!", "qué escenario"],
    naturaleza: ["qué paz", "¿dónde es?", "qué lugar hermoso", "necesito ir", "qué colores 😍"],
    general: ["qué buena", "me encanta", "la mejor", "otra vez!!", "saludos!!"],
  };
  const SONG = ["¡temazo!", "otra vez!!", "la amo", "subí el volumen", "qué voz", "esta es mía", "lloro", "me la sé toda", "la mejor", "desde Córdoba!!", "ufff", "❤️❤️❤️"];
  const KEYS = {
    nieve: /nieve|snow|esqu|ski|monta|mountain|invierno|winter/i,
    playa: /playa|beach|mar\b|sea|ocean|surf|wave|ola/i,
    ciudad: /ciudad|city|noche|night|urban|calle|street|neon|tráfico|traffic|london|tormenta/i,
    recital: /recital|concierto|concert|show|crowd|stage|escenario|karaoke|live|cantante|singer/i,
    naturaleza: /bosque|forest|lago|lake|naturaleza|nature|otoño|autumn|campo|field|flor|aurora/i,
  };
  const pick = (arr, i) => arr[i % arr.length];

  const api = {
    list: null, // [{ name, msg }]
    source: "", // "ai" | "tema" | "manual"
    /** Themed comments from the background's name and a few lyric lines. */
    themed(hint, lyricLines) {
      const theme = Object.keys(KEYS).find((k) => KEYS[k].test(hint || "")) || "general";
      const quotes = (lyricLines || []).filter((l) => l.length > 6 && l.length < 40).slice(0, 4).map((l) => `«${l.toLocaleLowerCase("es")}» 😭`);
      const msgs = [];
      for (let i = 0; i < 18; i++) {
        if (i % 3 === 1) msgs.push(pick(THEMES[theme], i));
        else if (i % 5 === 3 && quotes.length) msgs.push(pick(quotes, i));
        else msgs.push(pick(SONG, i * 7));
      }
      return msgs.map((msg, i) => ({ name: pick(NAMES, i * 5 + 3), msg }));
    },
    /** One JPEG frame of the current background, or null. */
    frame() {
      const bg = WM.BgVideo;
      const el = bg && bg.enabled ? (bg.kind === "image" ? bg.img : bg.el) : null;
      const w = el && (el.videoWidth || el.naturalWidth);
      const h = el && (el.videoHeight || el.naturalHeight);
      if (!w || !h) return Promise.resolve(null);
      const k = Math.min(1, 512 / Math.max(w, h));
      const c = document.createElement("canvas");
      c.width = Math.round(w * k);
      c.height = Math.round(h * k);
      try {
        c.getContext("2d").drawImage(el, 0, 0, c.width, c.height);
        return new Promise((res) => c.toBlob((b) => res(b), "image/jpeg", 0.8));
      } catch {
        return Promise.resolve(null);
      }
    },
    /** Ask our media service (OpenAI behind it) for comments that fit the video and song. */
    async generate({ url, token, lyrics, title, artist }) {
      const fd = new FormData();
      const img = await api.frame();
      if (img) fd.append("image", img, "frame.jpg");
      fd.append("lyrics", (lyrics || "").slice(0, 3000));
      fd.append("title", title || "");
      fd.append("artist", artist || "");
      let res;
      try {
        res = await fetch(url + "/comments", { method: "POST", headers: token ? { Authorization: "Bearer " + token } : {}, body: fd });
      } catch {
        throw new Error("No se pudo conectar con la IA");
      }
      if (res.status === 401) throw Object.assign(new Error("El token del servicio no es válido."), { code: "auth" });
      if (!res.ok) {
        let msg = "";
        try {
          msg = (await res.json()).detail;
        } catch {
          /* ignore */
        }
        throw new Error(msg || "La IA respondió con un error (" + res.status + ")");
      }
      const data = await res.json();
      const list = (data.comments || []).filter((c) => c && c.msg).map((c) => ({ name: String(c.name || "").slice(0, 18) || pick(NAMES, c.msg.length), msg: String(c.msg).slice(0, 60) }));
      if (!list.length) throw new Error("La IA no devolvió comentarios");
      return list;
    },
    /** "nombre: mensaje" per line <-> list */
    toText: (list) => (list || []).map((c) => `${c.name}: ${c.msg}`).join("\n"),
    fromText(text) {
      return text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l, i) => {
          const m = l.match(/^([^:]{1,20}):\s*(.+)$/);
          return m ? { name: m[1].trim(), msg: m[2].trim() } : { name: pick(NAMES, i * 5 + 3), msg: l };
        });
    },
  };
  WM.LiveChat = api;
})((window.WaveMusic = window.WaveMusic || {}));
