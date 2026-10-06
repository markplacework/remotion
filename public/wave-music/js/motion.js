// Wave Music · LYRICS PRO (motor común)
// Everything the motion presets (presets.js) share, so each preset only
// decides how words enter, move, stand out and leave:
//
//   Words   — per-word timing from the line timestamps. Today it's an
//             estimate; when the AI sync returns real word timestamps
//             (entry.words), they are used as-is and no preset changes.
//   Energy  — the song's loudness envelope and onsets ("beats"), decoded
//             once from the audio, so presets can react to the music.
//   frame() — builds the per-frame input every preset receives: a pure
//             function of time, so preview, seeking and export match.
(function (WM) {
  // ---------- words ----------
  const WORDS_PER_SEC = 2.6; // typical sung pace when a line has room

  /** Split one line into words with start/end times inside the line. */
  function wordsFor(entry, mode = WM.Motion ? WM.Motion.wordMode : "word") {
    // "Por frase": every word of the line shows at the line's start
    if (mode === "line") {
      return entry.text.split(/\s+/).filter(Boolean).map((text, i) => ({ text, t0: entry.start, t1: entry.start + 0.3, index: i }));
    }
    if (entry.words && entry.words.length) return entry.words;
    // real word times from the AI sync, kept relative to the line start
    // so a manual nudge of the line moves its words with it
    const ai = WM.AiWords && WM.AiWords[entry.lineId];
    if (ai && ai.text === entry.text) return ai.words.map((w, i) => ({ text: w.text, t0: entry.start + w.d0, t1: entry.start + w.d1, index: i }));
    const parts = entry.text.split(/\s+/).filter(Boolean);
    if (!parts.length) return [];
    const room = Math.max(0.4, entry.end - entry.start);
    // Sung span: proportional to the word count, never past ~85% of the gap.
    const span = Math.min(room * 0.85, Math.max(0.5, parts.length / WORDS_PER_SEC));
    const weights = parts.map((w) => 0.6 + Math.min(w.length, 10) / 10);
    const total = weights.reduce((a, b) => a + b, 0);
    let t = entry.start;
    return parts.map((text, i) => {
      const d = (weights[i] / total) * span;
      const w = { text, t0: t, t1: t + d, index: i };
      t += d;
      return w;
    });
  }

  function prepare(timeline, mode) {
    if (!timeline) return [];
    return timeline.entries.map((e, i) => ({ ...e, index: i, words: wordsFor(e, mode) }));
  }
  /** The word mode a preset runs with: word-paced styles always go word by word. */
  const modeFor = (preset) => (preset && preset.wordBased ? "word" : WM.Motion.wordMode);

  // ---------- energy ----------
  const RATE = 50; // envelope samples per second

  async function analyze(arrayBuffer) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    try {
      const buf = await ctx.decodeAudioData(arrayBuffer);
      const n = Math.ceil(buf.duration * RATE);
      const size = buf.sampleRate / RATE;
      const ch = [];
      for (let c = 0; c < buf.numberOfChannels; c++) ch.push(buf.getChannelData(c));
      const rms = new Float32Array(n);
      const low = new Float32Array(n);
      // one-pole low-pass (~150 Hz) for the kick/bass energy
      const a = Math.exp((-2 * Math.PI * 150) / buf.sampleRate);
      let lp = 0;
      for (let i = 0; i < n; i++) {
        const from = Math.floor(i * size);
        const to = Math.min(ch[0].length, Math.floor((i + 1) * size));
        let s = 0;
        let sl = 0;
        for (let j = from; j < to; j++) {
          let v = 0;
          for (let c = 0; c < ch.length; c++) v += ch[c][j];
          v /= ch.length;
          lp = (1 - a) * v + a * lp;
          s += v * v;
          sl += lp * lp;
        }
        const k = Math.max(1, to - from);
        rms[i] = Math.sqrt(s / k);
        low[i] = Math.sqrt(sl / k);
      }
      const norm = (arr) => {
        const sorted = Array.from(arr).sort((x, y) => x - y);
        const ref = sorted[Math.floor(sorted.length * 0.97)] || 1;
        for (let i = 0; i < arr.length; i++) arr[i] = Math.min(1, arr[i] / ref);
      };
      norm(rms);
      norm(low);
      // onsets: positive jumps of the bass energy, as a decaying pulse
      const pulse = new Float32Array(n);
      const decay = Math.exp(-1 / (RATE * 0.14));
      let avg = 0;
      for (let i = 0; i < n; i++) {
        avg = avg * 0.9 + low[i] * 0.1;
        const jump = Math.max(0, low[i] - avg * 1.15) * 3;
        pulse[i] = Math.min(1, Math.max(jump, i ? pulse[i - 1] * decay : 0));
      }
      // smoothed loudness for slow moves
      const energy = new Float32Array(n);
      let e = rms[0] || 0;
      for (let i = 0; i < n; i++) energy[i] = e = e * 0.85 + rms[i] * 0.15;
      return { rate: RATE, energy, pulse };
    } finally {
      ctx.close && ctx.close();
    }
  }

  const sample = (arr, rate, t) => {
    if (!arr) return 0;
    const i = Math.max(0, Math.min(arr.length - 1, Math.round(t * rate)));
    return arr[i];
  };

  // ---------- helpers for presets ----------
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = {
    out: (k) => 1 - Math.pow(1 - clamp(k), 3),
    inOut: (k) => {
      k = clamp(k);
      return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    },
    back: (k) => {
      k = clamp(k);
      const c = 1.9;
      return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2);
    },
  };
  /** Deterministic pseudo-random in [0,1) for an integer seed. */
  function rand(seed) {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  /**
   * The input every preset draws from.
   * @param {object} o { lines (prepare()), t, W, H, safe, energy, mockup, meta }
   */
  // Text that lands exactly with the voice reads as late on screen, so the
  // lyric runs a hair ahead of the audio (the beat stays on the audio).
  const LEAD = 0.08;

  function frame(o) {
    const lines = o.lines;
    const audioT = o.t;
    const t = o.t + LEAD;
    let current = -1;
    for (let i = 0; i < lines.length; i++) if (lines[i].start <= t) current = i;
    const track = o.energy;
    if (track && track.avg == null) {
      let s = 0;
      for (let i = 0; i < track.energy.length; i++) s += track.energy[i];
      track.avg = s / Math.max(1, track.energy.length);
    }
    const off = o.offset || { x: 0, y: 0 };
    return {
      W: o.W,
      H: o.H,
      t,
      safe: o.safe,
      // where the user dragged the lyric, in canvas units (from safe-area fractions)
      shift: { x: off.x * o.safe.w, y: off.y * o.safe.h },
      lines,
      current, // index of the newest line that has started (-1: none yet)
      mockup: !!o.mockup,
      // the user's background video (an HTMLVideoElement), when the style takes one
      video: o.video || null,
      // the user's text size (1 = the style's own) and typeface (null = the style's)
      textScale: o.textScale || 1,
      font: o.font || null,
      meta: o.meta || {},
      energy: (at = audioT) => (track ? sample(track.energy, track.rate, at) : 0.5),
      // the song's average loudness, to tell its loud parts from the rest
      energyAvg: track ? track.avg : 0.5,
      // Beat pulse; without an analysed track, word onsets stand in.
      pulse: (at = audioT) => {
        if (track) return sample(track.pulse, track.rate, at);
        let p = 0;
        const L = lines[current];
        if (L) for (const w of L.words) if (at >= w.t0) p = Math.max(p, Math.exp(-(at - w.t0) / 0.14));
        return p;
      },
    };
  }

  WM.Motion = { wordsFor, prepare, modeFor, analyze, frame, clamp, lerp, ease, rand, wordMode: "line" };
  WM.Energy = { current: null };
})((window.WaveMusic = window.WaveMusic || {}));
