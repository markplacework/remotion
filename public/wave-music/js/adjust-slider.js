// Wave Music · AJUSTE MANUAL (deslizador)
// Photo-editor style slider: zero in the middle, drag the knob left
// (earlier) or right (later). Double-click/tap the knob to reset to 0.
// Keyboard: ←/→ 10 ms, Shift 100 ms, Home = 0.
(function (WM) {
  class AdjustSlider {
    /**
     * @param {HTMLElement} root
     * @param {{ min:number, max:number, step:number,
     *           onStart(), onChange(v), onEnd() }} o
     */
    constructor(root, o) {
      this.o = o;
      this.value = 0;
      this.limits = [o.min, o.max];
      root.classList.add("adj-slider");
      root.innerHTML =
        '<div class="adj-track"><span class="adj-limit"></span><span class="adj-fill"></span>' +
        '<span class="adj-zero"></span><span class="adj-knob" role="slider" tabindex="0" ' +
        'aria-label="Desplazamiento" aria-valuemin="' + o.min * 1000 + '" aria-valuemax="' + o.max * 1000 + '"></span></div>';
      this.track = root.querySelector(".adj-track");
      this.fill = root.querySelector(".adj-fill");
      this.knob = root.querySelector(".adj-knob");
      this.limitEl = root.querySelector(".adj-limit");

      const fromX = (x) => {
        const r = this.track.getBoundingClientRect();
        const k = Math.min(1, Math.max(0, (x - r.left) / r.width));
        return o.min + k * (o.max - o.min);
      };
      let dragging = false;
      this.track.addEventListener("pointerdown", (e) => {
        if (e.button > 0 || e.detail > 1) return; // let dblclick reset
        // no text selection or native drag stealing the mouse on desktop
        e.preventDefault();
        this.knob.focus({ preventScroll: true });
        dragging = true;
        try {
          this.track.setPointerCapture(e.pointerId);
        } catch {
          /* window listeners below still follow the mouse */
        }
        o.onStart();
        this.emit(fromX(e.clientX));
      });
      const move = (e) => dragging && this.emit(fromX(e.clientX));
      const end = () => {
        if (!dragging) return;
        dragging = false;
        o.onEnd();
      };
      this.track.addEventListener("pointermove", move);
      window.addEventListener("pointermove", (e) => !this.track.hasPointerCapture(e.pointerId) && move(e));
      this.track.addEventListener("pointerup", end);
      window.addEventListener("pointerup", end);
      this.track.addEventListener("pointercancel", end);
      this.track.addEventListener("lostpointercapture", end);
      this.track.addEventListener("dblclick", () => {
        o.onStart();
        this.emit(0);
        o.onEnd();
      });
      this.knob.addEventListener("keydown", (e) => {
        const step = e.shiftKey ? 0.1 : o.step;
        let v = null;
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") v = this.value - step;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") v = this.value + step;
        if (e.key === "Home" || e.key === "0") v = 0;
        if (v == null) return;
        e.preventDefault();
        e.stopPropagation();
        o.onStart();
        this.emit(v);
        o.onEnd();
      });
    }

    emit(v) {
      const s = this.o.step;
      this.o.onChange(Math.round(v / s) * s);
    }

    pct(v) {
      return ((v - this.o.min) / (this.o.max - this.o.min)) * 100;
    }

    /** @param {number} v  current value  @param {[number,number]} limits reachable range */
    set(v, limits) {
      this.value = v;
      const p = this.pct(v);
      const z = this.pct(0);
      this.knob.style.left = p + "%";
      this.fill.style.left = Math.min(p, z) + "%";
      this.fill.style.width = Math.abs(p - z) + "%";
      this.knob.setAttribute("aria-valuenow", Math.round(v * 1000));
      this.knob.setAttribute("aria-valuetext", Math.round(v * 1000) + " ms");
      if (limits) {
        const a = this.pct(limits[0]);
        const b = this.pct(limits[1]);
        this.limitEl.style.left = a + "%";
        this.limitEl.style.width = Math.max(0, b - a) + "%";
      }
    }
  }

  WM.AdjustSlider = AdjustSlider;
})((window.WaveMusic = window.WaveMusic || {}));
