// Wave Music · TIMESTAMPS
// The timeline is the contract between "where do times come from" and
// "how are they shown":
//
//   Timeline = { source: string, entries: { lineId, text, start, end }[] }
//
// Times come from a *provider*. Every provider has the same signature,
//   provider.sync({ lines, duration, audio, options }) -> Promise<number[]>
// returning one start time (seconds) per line. Today we only have local
// test providers; the real AI provider plugs in here without touching
// sync, bubbles or preview.
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

    /** Placeholder for the real AI alignment (e.g. Whisper word
     * timestamps + lyric alignment on a backend). Same contract. */
    ai: {
      id: "ai",
      label: "IA (próximamente)",
      disabled: true,
      async sync(/* { audio, lines, duration } */) {
        throw new Error("Sincronización con IA todavía no disponible");
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
