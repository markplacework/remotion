// Wave Music · AJUSTE MANUAL (lógica)
// Non-destructive fine-tuning, like photo-editing adjustments: the
// generated timeline (test provider today, AI later) is never modified.
// We keep offsets on top of it and derive the final timeline:
//
//   final start[i] = baseline start[i] + global + line[i]
//
// Offsets are in seconds with 10 ms resolution (finer than one 30fps
// frame, ~33 ms). A line can't be moved past its neighbours.
(function (WM) {
  const T = WM.Timestamps;
  const MIN_GAP = 0.05;
  const RANGE = 1.5; // slider reach, seconds either way
  const r2 = (n) => Math.round(n * 100) / 100;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  class Adjustments {
    constructor(baseline, duration) {
      this.baseline = baseline;
      this.duration = duration;
      this.global = 0;
      this.line = baseline ? baseline.entries.map(() => 0) : [];
    }

    get dirty() {
      return this.global !== 0 || this.line.some((v) => v !== 0);
    }

    startOf(i) {
      return this.baseline.entries[i].start + this.global + this.line[i];
    }

    /** Range the line's own offset can take without crossing neighbours. */
    lineRange(i) {
      const n = this.line.length;
      const base = this.baseline.entries[i].start + this.global;
      const lo = i > 0 ? this.startOf(i - 1) + MIN_GAP : 0;
      const hi = i < n - 1 ? this.startOf(i + 1) - MIN_GAP : this.duration - MIN_GAP;
      return [Math.max(-RANGE, lo - base), Math.min(RANGE, hi - base)];
    }

    globalRange() {
      const s = this.line.map((_, i) => this.startOf(i) - this.global);
      return [Math.max(-RANGE, -Math.min(...s)), Math.min(RANGE, this.duration - MIN_GAP - Math.max(...s))];
    }

    setLine(i, v) {
      const [lo, hi] = this.lineRange(i);
      this.line[i] = r2(clamp(v, lo, hi));
    }
    setGlobal(v) {
      const [lo, hi] = this.globalRange();
      this.global = r2(clamp(v, lo, hi));
    }
    /** Put line i at an absolute time (typed in, or "fijar aquí"). */
    setLineStart(i, t) {
      this.setLine(i, t - this.baseline.entries[i].start - this.global);
    }

    snapshot() {
      return { global: this.global, line: this.line.slice() };
    }
    restore(s) {
      this.global = s.global;
      this.line = s.line.slice();
    }
    reset() {
      this.restore({ global: 0, line: this.line.map(() => 0) });
    }

    /** The timeline everything else (sync, preview) uses. */
    timeline() {
      const b = this.baseline;
      if (!this.dirty) return b;
      const lines = b.entries.map((e) => ({ id: e.lineId, text: e.text }));
      return T.buildTimeline(lines, lines.map((_, i) => this.startOf(i)), this.duration, "manual");
    }
  }

  class History {
    constructor(limit = 100) {
      this.stack = [];
      this.limit = limit;
    }
    push(s) {
      this.stack.push(s);
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

  WM.Adjust = { Adjustments, History, RANGE, MIN_GAP };
})((window.WaveMusic = window.WaveMusic || {}));
