// Wave Music · PREVISUALIZADOR
// 9:16 stage (1080x1920, scaled to fit) with the FakeChat background and
// the chat column laid out exactly like FakeChatScene (620px column at
// 1.6x). Receives sync state and renders it; it never reads the audio.
(function (WM) {
  const STAGE_W = 1080;
  const STAGE_H = 1920;
  const COLUMN_W = 620;
  const COLUMN_SCALE = 1.6;
  const TOP = 300; // where the conversation starts
  const BOTTOM_LIMIT = STAGE_H - 280; // newest bubble never goes below this
  const SAME_SENDER_GAP = 14;
  const SENDER_CHANGE_GAP = 26;

  class Preview {
    constructor(host, { backgroundSrc }) {
      this.host = host;
      this.bubbles = [];
      this.scroll = 0;
      this.lastFrameTs = 0;
      this.lastVisible = -1;
      this.contentH = 0;

      this.stage = document.createElement("div");
      this.stage.className = "wm-stage";
      this.stage.style.width = STAGE_W + "px";
      this.stage.style.height = STAGE_H + "px";
      this.stage.style.backgroundImage = `url("${backgroundSrc}")`;

      this.viewport = document.createElement("div");
      this.viewport.className = "wm-viewport";
      this.column = document.createElement("div");
      this.column.className = "wm-column";
      Object.assign(this.column.style, {
        width: COLUMN_W + "px",
        left: (STAGE_W - COLUMN_W * COLUMN_SCALE) / 2 + "px",
        top: TOP + "px",
        transformOrigin: "top left",
        padding: "0 12px",
      });
      this.viewport.appendChild(this.column);

      this.stage.appendChild(this.viewport);
      host.appendChild(this.stage);

      new ResizeObserver(() => this.fit()).observe(host);
      this.fit();
    }

    fit() {
      const r = this.host.getBoundingClientRect();
      const k = Math.min(r.width / STAGE_W, r.height / STAGE_H);
      this.stage.style.transform = `translate(-50%, -50%) scale(${k})`;
    }

    /** Build one bubble per lyric line. */
    setTimeline(timeline) {
      this.column.innerHTML = "";
      this.bubbles = [];
      this.lastVisible = -1;
      this.scroll = 0;
      const entries = timeline ? timeline.entries : [];
      this.host.classList.toggle("is-empty", !entries.length);
      if (!entries.length) return;

      this.column.appendChild(WM.Bubbles.createHoyPill("Hoy"));
      entries.forEach((e, i) => {
        const from = e.from || "me";
        const prevFrom = i > 0 ? entries[i - 1].from || "me" : from;
        const b = WM.Bubbles.createBubble({
          text: e.text,
          from,
          clock: clockFor(e.start),
          marginTop: i === 0 ? 0 : prevFrom !== from ? SENDER_CHANGE_GAP : SAME_SENDER_GAP,
        });
        this.column.appendChild(b.root);
        this.bubbles.push(b);
      });
    }

    /**
     * @param state  SyncEngine.stateAt(t)
     * @param opts   { playing, snap } — snap jumps scroll instantly (seek)
     */
    render(state, { playing = false, snap = false } = {}) {
      state.entries.forEach((s, i) =>
        this.bubbles[i] &&
        this.bubbles[i].update({ age: s.age, active: i === state.activeIndex, playing }),
      );

      if (state.visibleCount !== this.lastVisible) {
        this.lastVisible = state.visibleCount;
        this.contentH = this.column.offsetHeight * COLUMN_SCALE;
      }
      const target = Math.max(0, TOP + this.contentH - BOTTOM_LIMIT);

      const now = performance.now();
      const dt = Math.min(0.1, (now - (this.lastFrameTs || now)) / 1000);
      this.lastFrameTs = now;
      this.scroll = snap ? target : this.scroll + (target - this.scroll) * (1 - Math.exp(-dt * 9));
      if (Math.abs(target - this.scroll) < 0.3) this.scroll = target;
      this.column.style.transform = `translateY(${-this.scroll}px) scale(${COLUMN_SCALE})`;
    }
  }

  // WhatsApp-style clock on each bubble, advancing with the song.
  function clockFor(seconds) {
    const mins = 21 * 60 + 12 + Math.floor(seconds / 60);
    return String(Math.floor(mins / 60) % 24).padStart(2, "0") + ":" + String(mins % 60).padStart(2, "0");
  }

  WM.Preview = Preview;
})((window.WaveMusic = window.WaveMusic || {}));
