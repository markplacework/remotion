// Wave Music · SINCRONIZACIÓN
// Pure function of (timeline, time) -> conversation state. No memory of
// previous frames, so seeking anywhere gives exactly the right state
// immediately — the audio clock is the only source of truth.
(function (WM) {
  class SyncEngine {
    constructor() {
      this.entries = [];
    }

    setTimeline(timeline) {
      this.entries = timeline ? timeline.entries : [];
    }

    /** Number of lines whose start <= t (binary search). */
    visibleCountAt(t) {
      let lo = 0;
      let hi = this.entries.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (this.entries[mid].start <= t) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    }

    /**
     * @returns {{ time, visibleCount, activeIndex, entries: {age:number}[] }}
     *   age = seconds since the line started (negative = not yet).
     */
    stateAt(t) {
      const visibleCount = this.visibleCountAt(t);
      const last = visibleCount - 1;
      const activeIndex = last >= 0 && t < this.entries[last].end ? last : -1;
      return {
        time: t,
        visibleCount,
        activeIndex,
        entries: this.entries.map((e) => ({ age: t - e.start })),
      };
    }
  }

  WM.SyncEngine = SyncEngine;
})((window.WaveMusic = window.WaveMusic || {}));
