// Wave Music · TIMESTAMPS
// The timeline is the contract between "where do times come from" and
// "how are they shown":
//
//   Timeline = { source: string, entries: { lineId, text, start, end }[] }
//
// Times come from a *provider*. Every provider has the same signature,
//   provider.sync({ lines, duration, audio, options }) -> Promise<number[]>
// returning one start time (seconds) per line. The AI providers (OpenAI,
// Modal) also fill WM.AiWords with per-word times; neither sync, bubbles
// nor preview know which provider ran.
(function (WM) {
  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  /** Normalise start times: sorted, inside the song, ends = next start. */
  function buildTimeline(lines, starts, duration, source) {
    const dur = duration || Math.max(0, ...starts) + 4;
    const clean = lines.map((l, i) => Math.max(0, Math.min(dur, Number(starts[i]) || 0)));
    for (let i = 1; i < clean.length; i++) clean[i] = Math.max(clean[i], clean[i - 1]);
    return {
      source,
      entries: lines.map((l, i) => ({
        lineId: l.id,
        text: l.text,
        start: round2(clean[i]),
        end: round2(i + 1 < clean.length ? clean[i + 1] : dur),
      })),
    };
  }

  const providers = {
    /** Fixed spacing, e.g. 00:00, 00:03, 00:06... */
    interval: {
      id: "interval",
      label: "Intervalo fijo",
      async sync({ lines, options }) {
        const offset = Number(options.offset) || 0;
        const step = Math.max(0.5, Number(options.interval) || 3);
        return lines.map((_, i) => offset + i * step);
      },
    },

    /** Spread across the song, weighted by line length (longer lines
     * get a bit more air, closer to how they'd actually be sung). */
    spread: {
      id: "spread",
      label: "Repartir en la canción",
      async sync({ lines, duration, options }) {
        const offset = Number(options.offset) || 0;
        const usable = Math.max(1, (duration || lines.length * 3) - offset - 2);
        const weights = lines.map((l) => 1 + Math.min(l.text.length, 60) / 30);
        const total = weights.reduce((a, b) => a + b, 0);
        let t = offset;
        return weights.map((w) => {
          const s = t;
          t += (w / total) * usable;
          return s;
        });
      },
    },

    /** Times pasted inside the lyrics as LRC tags. */
    lrc: {
      id: "lrc",
      label: "Tiempos de la letra (LRC)",
      async sync({ embeddedStarts }) {
        if (!embeddedStarts) throw new Error("La letra no tiene tiempos [mm:ss]");
        return embeddedStarts;
      },
    },

    /** AI: OpenAI Whisper word timestamps aligned to the lyrics
     * (ai-sync.js). Test version: the key comes from the user. */
    ai: {
      id: "ai",
      label: "IA · OpenAI (automática)",
      async sync({ lines, duration, audio, askKey, onStatus }) {
        const AI = WM.AiSync;
        if (!audio || !audio.loaded) throw new Error("Primero cargá el audio");
        let key = AI.getKey() || (await askKey());
        const buf = await audio.getArrayBuffer();
        const file = audio.sourceFile;
        const blob = file || new Blob([buf], { type: "audio/mpeg" });
        const filename = file ? file.name : "cancion.mp3";
        const prompt = lines.map((l) => l.text).join(" ");
        let sung;
        for (let attempt = 0; ; attempt++) {
          try {
            if (onStatus) onStatus("Escuchando la canción…");
            sung = await AI.transcribe({ blob, filename, key, prompt });
            break;
          } catch (e) {
            if (e.code !== "auth" || attempt) throw e;
            AI.clearKey();
            key = await askKey(e.message + " Revisala y probá de nuevo.");
          }
        }
        if (!sung.length) throw new Error("La IA no encontró voz en el audio");
        if (onStatus) onStatus("Ubicando la letra…");
        const r = AI.align(lines, sung, duration);
        WM.AiWords = {};
        lines.forEach((l, i) => (WM.AiWords[l.id] = r.words[i]));
        WM.AiSync.last = { matched: r.matched, total: r.total };
        return r.starts;
      },
    },

    /** AI, precise: our Modal GPU service (modal-sync.js) isolates the
     * voice with Demucs and force-aligns the lyrics with WhisperX. */
    modal: {
      id: "modal",
      label: "IA precisa (Modal)",
      async sync({ lines, audio, askModal, onStatus }) {
        const M = WM.ModalSync;
        if (!audio || !audio.loaded) throw new Error("Primero cargá el audio");
        let url = M.getUrl();
        let token = M.getToken();
        if (!M.isConfigured()) ({ url, token } = await askModal());
        const buf = await audio.getArrayBuffer();
        const file = audio.sourceFile;
        const blob = file || new Blob([buf], { type: "audio/mpeg" });
        const filename = file ? file.name : "cancion.mp3";
        let r;
        for (let attempt = 0; ; attempt++) {
          try {
            if (onStatus) onStatus("Separando la voz y ubicando la letra…");
            r = await M.sync({ blob, filename, lines, url, token });
            break;
          } catch (e) {
            if ((e.code !== "auth" && e.code !== "network") || attempt) throw e;
            ({ url, token } = await askModal(e.message));
          }
        }
        WM.AiWords = {};
        lines.forEach((l, i) => (WM.AiWords[l.id] = r.words[i]));
        WM.AiSync.last = { matched: r.matched, total: r.total };
        return r.starts;
      },
    },
  };

  async function generate(providerId, input) {
    const provider = providers[providerId];
    if (!provider) throw new Error("Proveedor desconocido: " + providerId);
    const starts = await provider.sync(input);
    return buildTimeline(input.lines, starts, input.duration, provider.id);
  }

  /** Replace one start time (manual nudge) and re-normalise. */
  function withStart(timeline, index, start, duration) {
    const lines = timeline.entries.map((e) => ({ id: e.lineId, text: e.text }));
    const starts = timeline.entries.map((e) => e.start);
    starts[index] = start;
    return buildTimeline(lines, starts, duration, "manual");
  }

  function format(t, withCents) {
    t = Math.max(0, t || 0);
    const m = Math.floor(t / 60);
    const s = t - m * 60;
    const ss = withCents ? s.toFixed(2).padStart(5, "0") : String(Math.floor(s)).padStart(2, "0");
    return String(m).padStart(2, "0") + ":" + ss;
  }

  function parse(str) {
    const m = /^\s*(?:(\d+):)?(\d+(?:[.,]\d+)?)\s*$/.exec(String(str));
    if (!m) return NaN;
    return Number(m[1] || 0) * 60 + Number(m[2].replace(",", "."));
  }

  WM.Timestamps = { providers, generate, buildTimeline, withStart, format, parse };
})((window.WaveMusic = window.WaveMusic || {}));
