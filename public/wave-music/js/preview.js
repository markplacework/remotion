// Wave Music · PREVISUALIZADOR
// 9:16 stage (1080x1920, scaled to fit) laid out exactly like the
// lyric-sync standard: background-alt wallpaper, src/lyricSyncDefaults.ts
// margins (TikTok-safe) and AutoScrollChatLog's scrolling. Receives
// sync state and renders it; it never reads the audio.
(function (WM) {
  const STAGE_W = 1080;
  const STAGE_H = 1920;

  // Mirrors src/lyricSyncDefaults.ts — keep in sync with it.
  const TOP_MARGIN = 190;
  const BOTTOM_MARGIN = 320;
  const LEFT_MARGIN = 40;
  const SAFE_RIGHT_EDGE = 935;
  const SCALE = 1.6;
  const CONTENT_WIDTH = Math.round((SAFE_RIGHT_EDGE - LEFT_MARGIN) / SCALE);
  const VIEWPORT_HEIGHT = Math.round((STAGE_H - TOP_MARGIN - BOTTOM_MARGIN) / SCALE);

  // Mirrors src/components/AutoScrollChatLog.tsx
  const BOTTOM_PADDING = 18;
  const SAME_SENDER_GAP = 14;
  const SENDER_CHANGE_GAP = 26;
  const scrollSpring = WM.Bubbles.makeSpring(18, 0.7);

  class Preview {
    constructor(host, { backgroundSrc }) {
      this.host = host;
      this.bubbles = [];
      this.bottoms = null;

      this.stage = document.createElement("div");
      this.stage.className = "wm-stage";
      this.stage.style.width = STAGE_W + "px";
      this.stage.style.height = STAGE_H + "px";
      this.stage.style.backgroundImage = `url("${backgroundSrc}")`;

      // Scaled wrapper, same as the scene's scale(1.6) top-left div.
      const scaler = document.createElement("div");
      Object.assign(scaler.style, {
        position: "absolute",
        left: LEFT_MARGIN + "px",
        top: TOP_MARGIN + "px",
        transform: `scale(${SCALE})`,
        transformOrigin: "top left",
      });
      // Fixed viewport that clips overflow, like real WhatsApp.
      this.viewport = document.createElement("div");
      Object.assign(this.viewport.style, {
        width: CONTENT_WIDTH + "px",
        height: VIEWPORT_HEIGHT + "px",
        overflow: "hidden",
        position: "relative",
      });
      this.content = document.createElement("div");
      this.content.style.padding = "24px 12px 0";
      this.viewport.appendChild(this.content);
      scaler.appendChild(this.viewport);
      this.stage.appendChild(scaler);
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
      this.content.innerHTML = "";
      this.bubbles = [];
      this.bottoms = null;
      const entries = timeline ? timeline.entries : [];
      this.host.classList.toggle("is-empty", !entries.length);
      if (!entries.length) return;

      this.content.appendChild(WM.Bubbles.createHoyPill("Hoy"));
      entries.forEach((e, i) => {
        const from = e.from || "me";
        const prevFrom = i > 0 ? entries[i - 1].from || "me" : from;
        const b = WM.Bubbles.createBubble({
          text: e.text,
          from,
          clock: clockFor(e.start),
          marginTop: i === 0 ? 0 : prevFrom !== from ? SENDER_CHANGE_GAP : SAME_SENDER_GAP,
        });
        this.content.appendChild(b.root);
        this.bubbles.push(b);
      });
    }

    // Bottom edge of each bubble inside the content, measured once with
    // every bubble laid out (layout never changes afterwards, only
    // opacity/transform) — same approach as AutoScrollChatLog.
    measure() {
      this.bubbles.forEach((b) => (b.root.style.display = "flex"));
      this.bottoms = this.bubbles.map((b) => b.root.offsetTop + b.root.offsetHeight);
      this.bubbles.forEach((b) => b.reset());
    }

    scrollFor(index) {
      return index >= 0 && this.bottoms ? Math.max(0, this.bottoms[index] - VIEWPORT_HEIGHT + BOTTOM_PADDING) : 0;
    }

    /**
     * Pure function of the sync state, so seeking renders the exact
     * frame. @param opts { playing }
     */
    render(state, { playing = false } = {}) {
      if (!this.bubbles.length) return;
      if (!this.bottoms) this.measure();

      state.entries.forEach((s, i) =>
        this.bubbles[i].update({ age: s.age, active: i === state.activeIndex, playing }),
      );

      // AutoScrollChatLog: glide from the previous line's scroll to the
      // newest line's, keyed off the newest line's start.
      const last = state.visibleCount - 1;
      const ease = last >= 0 ? Math.min(scrollSpring(state.entries[last].age), 1) : 0;
      const prev = this.scrollFor(last - 1);
      const next = this.scrollFor(last);
      const y = prev + (next - prev) * ease;
      this.content.style.transform = `translateY(${-y}px)`;
    }
  }

  // WhatsApp-style clock on each bubble, advancing with the song.
  function clockFor(seconds) {
    const mins = 21 * 60 + 12 + Math.floor(seconds / 60);
    return String(Math.floor(mins / 60) % 24).padStart(2, "0") + ":" + String(mins % 60).padStart(2, "0");
  }

  WM.Preview = Preview;
})((window.WaveMusic = window.WaveMusic || {}));
