// Wave Music · AJUSTE MANUAL (barra de tiempo)
// Zoomed timeline strip: waveform + one draggable marker per line start
// + playhead. Shows a window of a few seconds so a pixel is ~10-30 ms.
//   drag a marker      -> move that line
//   click elsewhere    -> seek there
//   drag empty / wheel -> pan the window
(function (WM) {
  const HIT = 9; // px either side of a marker that grabs it
  const LABEL_H = 18;

  class AdjustStrip {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {{ onSeek(t), onDragStart(i), onDrag(i, t), onDragEnd(i) }} cb
     */
    constructor(canvas, cb) {
      this.canvas = canvas;
      this.cb = cb;
      this.peaks = null;
      this.windowSec = 8;
      this.viewStart = 0;
      this.drag = null; // { kind: 'marker'|'pan'|'click', ... }
      this.state = { timeline: null, time: 0, selected: -1, duration: 0 };

      canvas.addEventListener("pointerdown", (e) => this.onDown(e));
      canvas.addEventListener("pointermove", (e) => this.onMove(e));
      canvas.addEventListener("pointerup", (e) => this.onUp(e));
      canvas.addEventListener("pointercancel", (e) => this.onUp(e));
      canvas.addEventListener(
        "wheel",
        (e) => {
          e.preventDefault();
          const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
          this.pan((d / this.width) * this.windowSec);
        },
        { passive: false },
      );
    }

    setPeaks(p) {
      this.peaks = p;
    }

    setZoom(sec) {
      const center = this.viewStart + this.windowSec / 2;
      this.windowSec = sec;
      this.viewStart = center - sec / 2;
      this.clampView();
    }

    get width() {
      return this.canvas.clientWidth || 1;
    }
    get height() {
      return this.canvas.clientHeight || 1;
    }
    xOf(t) {
      return ((t - this.viewStart) / this.windowSec) * this.width;
    }
    tOf(x) {
      return this.viewStart + (x / this.width) * this.windowSec;
    }

    clampView() {
      const d = this.state.duration || 0;
      this.viewStart = Math.max(0, Math.min(this.viewStart, Math.max(0, d - this.windowSec)));
    }
    pan(dt) {
      this.viewStart += dt;
      this.clampView();
      this.userPanned = performance.now();
    }
    /** Re-centre if `t` is outside the comfortable middle of the window. */
    follow(t, force) {
      if (this.drag) return;
      const a = this.viewStart + this.windowSec * 0.12;
      const b = this.viewStart + this.windowSec * 0.88;
      if (force || t < a || t > b) {
        this.viewStart = t - this.windowSec * 0.35;
        this.clampView();
      }
    }

    // ---------- pointer ----------
    pointerX(e) {
      return e.clientX - this.canvas.getBoundingClientRect().left;
    }
    markerAt(x) {
      const tl = this.state.timeline;
      if (!tl) return -1;
      let best = -1;
      let bestD = HIT + 1;
      tl.entries.forEach((en, i) => {
        let d = Math.abs(this.xOf(en.start) - x);
        if (i === this.state.selected) d -= 3; // prefer the selected one
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      return bestD <= HIT ? best : -1;
    }
    onDown(e) {
      const x = this.pointerX(e);
      this.canvas.setPointerCapture(e.pointerId);
      const i = this.markerAt(x);
      if (i >= 0) {
        const en = this.state.timeline.entries[i];
        this.drag = { kind: "marker", i, grab: this.tOf(x) - en.start };
        this.cb.onDragStart(i);
      } else {
        this.drag = { kind: "click", x0: x, view0: this.viewStart };
      }
    }
    onMove(e) {
      const x = this.pointerX(e);
      if (!this.drag) {
        this.canvas.style.cursor = this.markerAt(x) >= 0 ? "ew-resize" : "pointer";
        return;
      }
      if (this.drag.kind === "marker") {
        this.cb.onDrag(this.drag.i, this.tOf(x) - this.drag.grab);
      } else {
        const dx = x - this.drag.x0;
        if (this.drag.kind === "click" && Math.abs(dx) > 4) this.drag.kind = "pan";
        if (this.drag.kind === "pan") {
          this.viewStart = this.drag.view0 - (dx / this.width) * this.windowSec;
          this.clampView();
          this.userPanned = performance.now();
        }
      }
    }
    onUp(e) {
      if (!this.drag) return;
      const d = this.drag;
      this.drag = null;
      if (d.kind === "marker") this.cb.onDragEnd(d.i);
      else if (d.kind === "click") this.cb.onSeek(this.tOf(this.pointerX(e)));
    }

    // ---------- drawing ----------
    draw(state) {
      this.state = state;
      const c = this.canvas;
      const dpr = window.devicePixelRatio || 1;
      const W = this.width;
      const H = this.height;
      if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      }
      const g = c.getContext("2d");
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      const css = getComputedStyle(document.documentElement);
      const col = (n) => css.getPropertyValue(n).trim();
      const accent2 = col("--accent-2") || "#22d3f5";

      const top = LABEL_H;
      const waveH = H - top - 14;
      const mid = top + waveH / 2;

      // second grid + labels
      g.font = "10px Inter, sans-serif";
      g.textBaseline = "alphabetic";
      const step = this.windowSec > 10 ? 2 : 1;
      for (let s = Math.ceil(this.viewStart / step) * step; s <= this.viewStart + this.windowSec; s += step) {
        const x = Math.round(this.xOf(s)) + 0.5;
        g.fillStyle = "rgba(255,255,255,0.06)";
        g.fillRect(x, top, 1, waveH);
        g.fillStyle = "rgba(255,255,255,0.32)";
        g.fillText(WM.Timestamps.format(s), x + 3, H - 3);
      }

      // waveform
      if (this.peaks) {
        const { peaks, perSecond } = this.peaks;
        for (let x = 0; x < W; x += 2) {
          const i0 = Math.floor(this.tOf(x) * perSecond);
          const i1 = Math.max(i0 + 1, Math.floor(this.tOf(x + 2) * perSecond));
          let m = 0;
          for (let i = i0; i < i1 && i < peaks.length; i++) if (i >= 0 && peaks[i] > m) m = peaks[i];
          const h = Math.max(1, m * waveH * 0.92);
          g.fillStyle = this.tOf(x) <= state.time ? "rgba(34,211,245,0.55)" : "rgba(255,255,255,0.2)";
          g.fillRect(x, mid - h / 2, 1.4, h);
        }
      } else {
        g.fillStyle = "rgba(255,255,255,0.08)";
        g.fillRect(0, mid, W, 1);
      }

      // line regions + markers
      const tl = state.timeline;
      if (tl) {
        tl.entries.forEach((en, i) => {
          const x0 = this.xOf(en.start);
          const x1 = this.xOf(en.end);
          if (x1 < 0 || x0 > W) return;
          const sel = i === state.selected;
          if (sel) {
            g.fillStyle = "rgba(30,139,255,0.13)";
            g.fillRect(x0, top, x1 - x0, waveH);
          }
          // label lane
          g.save();
          g.beginPath();
          g.rect(x0, 0, Math.max(0, x1 - x0 - 4), LABEL_H);
          g.clip();
          g.fillStyle = sel ? "#eef1f7" : "rgba(255,255,255,0.45)";
          g.font = (sel ? "600 " : "") + "11px Inter, sans-serif";
          g.fillText(i + 1 + "  " + en.text, x0 + 7, 12);
          g.restore();
          // marker
          g.fillStyle = sel ? accent2 : "rgba(255,255,255,0.55)";
          g.fillRect(Math.round(x0) - 1, 2, 2, top + waveH - 2);
          // grip
          g.beginPath();
          const gx = Math.round(x0);
          g.roundRect ? g.roundRect(gx - 4, top + waveH - 14, 8, 14, 3) : g.rect(gx - 4, top + waveH - 14, 8, 14);
          g.fillStyle = sel ? accent2 : "rgba(255,255,255,0.4)";
          g.fill();
        });
      }

      // playhead
      const px = this.xOf(state.time);
      if (px >= 0 && px <= W) {
        g.fillStyle = "#fff";
        g.fillRect(Math.round(px), 0, 1.5, H - 12);
        g.beginPath();
        g.moveTo(px - 4, 0);
        g.lineTo(px + 5, 0);
        g.lineTo(px + 0.5, 6);
        g.fill();
      }
    }
  }

  WM.AdjustStrip = AdjustStrip;
})((window.WaveMusic = window.WaveMusic || {}));
