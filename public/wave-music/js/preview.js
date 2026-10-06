// Wave Music · PREVISUALIZADOR
// Renders the sync state into a stage. The chat itself (wallpaper +
// bubbles + AutoScrollChatLog-style scrolling) is the same in every
// framing; only the framing changes:
//
//   "video"  — the exported 9:16 video (1080x1920): wallpaper full-bleed,
//              chat inside src/lyricSyncDefaults.ts' TikTok-safe margins.
//   "mockup" — preview only: the same chat shown inside the WhatsApp
//              phone mockup's screen. The mockup is never part of the
//              exported video.
//
// It never reads the audio — it only receives state.
(function (WM) {
  const BOTTOM_PADDING = 18; // AutoScrollChatLog
  const SAME_SENDER_GAP = 14;
  const SENDER_CHANGE_GAP = 26;
  const scrollSpring = WM.Bubbles.makeSpring(18, 0.7);

  // Mirrors src/lyricSyncDefaults.ts — keep in sync with it.
  const LS = { top: 190, bottom: 320, left: 40, safeRight: 935, scale: 1.6 };

  // Mockup screen hole, measured from the PNG's own transparent pixels
  // (853x1843): x 63-788, from under the header (y 288) to the bottom
  // of the screen behind the input bar (y ~1620).
  // The phone itself spans x 26-826, y 46-1797 of the PNG; the stage is
  // cropped to that so no transparent margin eats preview space.
  const CROP = { x: 26, y: 46, w: 800, h: 1751 };
  const SCREEN = { x: 62 - CROP.x, y: 286 - CROP.y, w: 728, h: 1336 };
  const INPUT_BAR_TOP = 1604 - CROP.y;
  const MOCKUP_SCALE = 1.45; // bubble size relative to a real phone screen

  const LAYOUTS = {
    video: {
      id: "video",
      stageW: 1080,
      stageH: 1920,
      bg: { x: 0, y: 0, w: 1080, h: 1920 },
      // Lyric-sync standard: the chat starts at the top of the safe area.
      anchor: "top",
      chat: {
        x: LS.left,
        y: LS.top,
        scale: LS.scale,
        width: Math.round((LS.safeRight - LS.left) / LS.scale),
        height: Math.round((1920 - LS.top - LS.bottom) / LS.scale),
      },
    },
    mockup: {
      id: "mockup",
      stageW: CROP.w,
      stageH: CROP.h,
      bg: SCREEN,
      chat: {
        // 12px side inset + the chat's own 12px padding (x1.45) ≈ real
        // WhatsApp's bubble margin to the screen edge.
        x: SCREEN.x + 12,
        y: SCREEN.y,
        scale: MOCKUP_SCALE,
        width: Math.round((SCREEN.w - 24) / MOCKUP_SCALE),
        height: Math.round((INPUT_BAR_TOP - SCREEN.y - 6) / MOCKUP_SCALE),
      },
      frame: { x: -CROP.x, y: -CROP.y, w: 853, h: 1843 },
      // Like a real phone: the newest message sits just above the input
      // bar and the conversation grows upwards.
      anchor: "bottom",
    },
  };

  const px = (n) => n + "px";
  const box = (el, r) => Object.assign(el.style, { position: "absolute", left: px(r.x), top: px(r.y), width: px(r.w), height: px(r.h) });

  class Preview {
    constructor(host, { backgroundSrc, mockupSrc, layout = "mockup" }) {
      this.host = host;
      this.backgroundSrc = backgroundSrc;
      this.mockupSrc = mockupSrc;
      this.timeline = null;
      new ResizeObserver(() => this.fit()).observe(host);
      this.setLayout(layout);
    }

    setLayout(id) {
      const L = LAYOUTS[id] || LAYOUTS.mockup;
      this.layout = L;
      if (this.stage) this.stage.remove();
      this.host.dataset.layout = L.id;
      // The preview box keeps the phone's proportions in both framings, so
      // switching never changes its size. "Video final" fills it like
      // object-fit: cover — the exported file is still the full 1080x1920;
      // only the wallpaper at the sides falls outside the box (the chat
      // stays inside the TikTok-safe area, so every bubble is visible).
      this.host.style.setProperty("--stage-aspect", `${CROP.w} / ${CROP.h}`);
      this.host.style.setProperty("--stage-ratio", CROP.w / CROP.h);

      const stage = (this.stage = document.createElement("div"));
      stage.className = "wm-stage";
      stage.style.width = px(L.stageW);
      stage.style.height = px(L.stageH);

      // 1. Wallpaper
      const bg = document.createElement("div");
      box(bg, L.bg);
      Object.assign(bg.style, {
        backgroundImage: `url("${this.backgroundSrc}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      });
      stage.appendChild(bg);

      // 2. Chat: scaled wrapper + fixed viewport that clips overflow.
      const scaler = document.createElement("div");
      Object.assign(scaler.style, {
        position: "absolute",
        left: px(L.chat.x),
        top: px(L.chat.y),
        transform: `scale(${L.chat.scale})`,
        transformOrigin: "top left",
      });
      const viewport = document.createElement("div");
      Object.assign(viewport.style, {
        width: px(L.chat.width),
        height: px(L.chat.height),
        overflow: "hidden",
        position: "relative",
      });
      this.content = document.createElement("div");
      this.content.style.padding = "24px 12px 0";
      viewport.appendChild(this.content);
      scaler.appendChild(viewport);
      stage.appendChild(scaler);

      // 3. Device frame on top (preview only)
      if (L.frame) {
        const frame = document.createElement("img");
        frame.src = this.mockupSrc;
        frame.alt = "";
        box(frame, L.frame);
        // The frame is deliberately wider than the cropped stage; hosts
        // that reset img { max-width: 100% } (the claude.ai viewer does)
        // would squash it out of line with the chat.
        frame.style.maxWidth = "none";
        frame.style.maxHeight = "none";
        frame.style.pointerEvents = "none";
        stage.appendChild(frame);
      }

      this.host.appendChild(stage);
      this.fit();
      this.setTimeline(this.timeline);
    }

    fit() {
      if (!this.stage) return;
      const r = this.host.getBoundingClientRect();
      const fx = r.width / this.layout.stageW;
      const fy = r.height / this.layout.stageH;
      const k = this.layout.frame ? Math.min(fx, fy) : Math.max(fx, fy);
      this.stage.style.transform = `translate(-50%, -50%) scale(${k})`;
    }

    /** Build one bubble per lyric line. */
    setTimeline(timeline) {
      this.timeline = timeline;
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
      const pill = this.content.firstChild;
      this.pillBottom = pill.offsetTop + pill.offsetHeight;
      this.bubbles.forEach((b) => b.reset());
    }

    /** How far the content is moved up so line `index` (-1 = none yet)
     * is in place; negative when bottom-anchored content is pushed down. */
    scrollFor(index) {
      if (!this.bottoms) return 0;
      const h = this.layout.chat.height;
      const bottom = index >= 0 ? this.bottoms[index] : this.pillBottom;
      const s = bottom - h + BOTTOM_PADDING;
      return this.layout.anchor === "bottom" ? s : Math.max(0, s);
    }

    /**
     * Pure function of the sync state, so seeking renders the exact frame.
     * @returns {{ scroll:number, looks:object[] }} what was drawn, for the
     *   video renderer
     */
    render(state, { playing = false } = {}) {
      if (!this.bubbles.length) return { scroll: 0, looks: [] };
      if (!this.bottoms) this.measure();

      const looks = state.entries.map((s, i) =>
        this.bubbles[i].update({ age: s.age, active: i === state.activeIndex, playing }),
      );

      // AutoScrollChatLog: glide from the previous line's scroll to the
      // newest line's, keyed off the newest line's start.
      const last = state.visibleCount - 1;
      const ease = last >= 0 ? Math.min(scrollSpring(state.entries[last].age), 1) : 0;
      const prev = this.scrollFor(last - 1);
      const next = this.scrollFor(last);
      const scroll = prev + (next - prev) * ease;
      this.content.style.transform = `translateY(${-scroll}px)`;
      return { scroll, looks };
    }
  }

  // WhatsApp-style clock on each bubble, advancing with the song.
  function clockFor(seconds) {
    const mins = 21 * 60 + 12 + Math.floor(seconds / 60);
    return String(Math.floor(mins / 60) % 24).padStart(2, "0") + ":" + String(mins % 60).padStart(2, "0");
  }

  WM.Preview = Preview;
  WM.Preview.LAYOUTS = LAYOUTS;
})((window.WaveMusic = window.WaveMusic || {}));
