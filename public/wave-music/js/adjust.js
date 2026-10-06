// Wave Music · AJUSTE MANUAL (lógica)
// Fine-tuning on top of whatever produced the timeline (test provider
// today, AI later). Pure operations that return a new timeline, plus an
// undo history. Times have 10 ms resolution (finer than one 30fps frame,
// which is ~33 ms).
(function (WM) {
  const T = WM.Timestamps;
  const MIN_GAP = 0.05; // two lines never collapse onto the same instant

  const linesOf = (tl) => tl.entries.map((e) => ({ id: e.lineId, text: e.text }));
  const startsOf = (tl) => tl.entries.map((e) => e.start);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  /** Move one line to `t`, kept between its neighbours. */
  function setStart(tl, i, t, duration) {
    const s = startsOf(tl);
    const lo = i > 0 ? s[i - 1] + MIN_GAP : 0;
    const hi = i < s.length - 1 ? s[i + 1] - MIN_GAP : Math.max(lo, duration - MIN_GAP);
    s[i] = clamp(t, lo, hi);
    return T.buildTimeline(linesOf(tl), s, duration, "manual");
  }

  function shiftLine(tl, i, delta, duration) {
    return setStart(tl, i, tl.entries[i].start + delta, duration);
  }

  /** Move every line by the same amount (whole sync early/late). */
  function shiftAll(tl, delta, duration) {
    const s = startsOf(tl);
    if (!s.length) return tl;
    const d = clamp(delta, -s[0], Math.max(0, duration - MIN_GAP - s[s.length - 1]));
    return T.buildTimeline(linesOf(tl), s.map((v) => v + d), duration, "manual");
  }

  class History {
    constructor(limit = 100) {
      this.stack = [];
      this.limit = limit;
    }
    push(tl) {
      if (!tl) return;
      this.stack.push(tl);
      if (this.stack.length > this.limit) this.stack.shift();
    }
    undo() {
      return this.stack.pop() || null;
    }
    clear() {
      this.stack = [];
    }
    get canUndo() {
      return this.stack.length > 0;
    }
  }

  WM.Adjust = { setStart, shiftLine, shiftAll, History, MIN_GAP };
})((window.WaveMusic = window.WaveMusic || {}));
