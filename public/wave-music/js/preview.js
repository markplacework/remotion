// Wave Music · PREVISUALIZADOR
// Renders the sync state into a stage, in the chosen style (themes.js)
// and framing:
//
//   "video"  — the exported 9:16 video (1080x1920): background full-bleed,
//              content inside src/lyricSyncDefaults.ts' TikTok-safe margins.
//   "mockup" — preview only: the same content inside the phone mockup's
//              screen. WhatsApp, Instagram and Messenger use mockups with
//              their app UI baked in; Spotify draws its player (chrome.js)
//              inside a frame-only phone. The mockup is never exported.
//
// It never reads the audio — it only receives state.
(function (WM) {
  const BOTTOM_PADDING = 18; // AutoScrollChatLog
  const SAME_SENDER_GAP = 14;
  const SENDER_CHANGE_GAP = 26;
  const LYRIC_ANCHOR = 0.32; // Spotify: the sung line sits ~a third down
  const scrollSpring = WM.Bubbles.makeSpring(18, 0.7);

  // Mirrors src/lyricSyncDefaults.ts — keep in sync with it.
  const LS = { top: 190, bottom: 320, left: 40, safeRight: 935, scale: 1.6 };

  // Mockup geometry, measured from each PNG's own pixels. Every phone is
  // cropped to the same proportions (0.457), so the preview box never
  // changes size between styles.
  //   WhatsApp (853x1843): phone x 26-826, y 46-1797; chat from under its
  //     header (y 286) to its input bar (y 1604).
  //   Instagram / Messenger (840x1872): phone x 16-831, y 40-1831; the
  //     transparent screen hole is the chat area (IG y 260-1581, Messenger
  //     y 287-1578 under its rounded header).
  //   Spotify: the WhatsApp phone with its screen cleared (phone-frame.png),
  //     screen x 63-788, y 77-1766, UI drawn by chrome.js.
  const WA_CROP = { x: 26, y: 46, w: 800, h: 1751 };
  const META_CROP = { x: 14, y: 40, w: 819, h: 1792 };
  const MOCKUPS = {
    // clock: the status-bar time baked into each mockup (its digits' box),
    // covered with the real time.
    whatsapp: { asset: "mockup", img: [853, 1843], crop: WA_CROP, bg: { x: 62, y: 286, w: 728, h: 1336 }, chat: { x: 62, y: 286, w: 728, bottom: 1598 }, clock: { x: 125, y: 108, w: 80, h: 22, bg: "#011816", weight: 600 } },
    instagram: { asset: "mockupInstagram", img: [840, 1872], crop: META_CROP, bg: { x: 55, y: 252, w: 729, h: 1340 }, chat: { x: 59, y: 260, w: 721, bottom: 1574 }, clock: { x: 92, y: 114, w: 71, h: 23, bg: "#000", weight: 400 } },
    messenger: { asset: "mockupMessenger", img: [840, 1872], crop: META_CROP, bg: { x: 53, y: 270, w: 733, h: 1318 }, chat: { x: 57, y: 287, w: 726, bottom: 1571 }, clock: { x: 92, y: 115, w: 70, h: 22, bg: "#000", weight: 400 } },
    // Lyrics Pro styles: the frame-only phone, the preset fills the screen.
    motion: { asset: "frame", img: [853, 1843], crop: WA_CROP, bg: { x: 63, y: 77, w: 726, h: 1690 }, bgRadius: 92, chat: { x: 63, y: 77, w: 726, bottom: 1767 }, chrome: "status" },
    spotify: { asset: "frame", img: [853, 1843], crop: WA_CROP, bg: { x: 63, y: 77, w: 726, h: 1690 }, bgRadius: 92, chat: { x: 103, y: 282, w: 646, bottom: 1416 }, chrome: true },
  };
  const BOX_ASPECT = WA_CROP.w / WA_CROP.h;
  const MOCKUP_SCALE = 1.45; // content size relative to a real phone screen

  // Lyrics Pro: where text may go. Video: inside the TikTok-safe area and
  // the preview's visible box; mockup: the phone screen minus status bar
  // and home indicator (canvas-local coordinates).
  const MOTION_SAFE = { video: { x: 140, y: 230, w: 800, h: 1310 }, mockup: { x: 46, y: 150, w: 634, h: 1390 } };
  const NO_CHAT = { x: 0, y: 0, scale: 1, width: 1, height: 1 };

  function layoutFor(framing, theme) {
    const lyrics = theme.kind === "lyrics";
    if (theme.kind === "motion") {
      if (framing === "video") {
        return { id: "video", stageW: 1080, stageH: 1920, bg: { x: 0, y: 0, w: 1080, h: 1920 }, chat: NO_CHAT, motion: true, safe: MOTION_SAFE.video, fit: "cover" };
      }
      const M = MOCKUPS.motion;
      const c = M.crop;
      return {
        id: "mockup",
        stageW: c.w,
        stageH: c.h,
        bg: { x: M.bg.x - c.x, y: M.bg.y - c.y, w: M.bg.w, h: M.bg.h },
        bgRadius: M.bgRadius,
        chat: NO_CHAT,
        chrome: "status",
        motion: true,
        safe: MOTION_SAFE.mockup,
        frame: { asset: M.asset, x: -c.x, y: -c.y, w: M.img[0], h: M.img[1] },
        fit: "contain",
      };
    }
    if (framing === "video") {
      // TikTok-safe margins (lyricSyncDefaults). Spotify's left-aligned
      // lyrics also keep clear of the ~100px each side that the
      // phone-shaped preview box crops off the 9:16 frame.
      const scale = lyrics ? 1.9 : LS.scale;
      const top = lyrics ? LS.top + 170 : LS.top; // room for title/artist
      const left = lyrics ? 130 : LS.left;
      return {
        id: "video",
        stageW: 1080,
        stageH: 1920,
        bg: { x: 0, y: 0, w: 1080, h: 1920 },
        header: lyrics ? { x: 130, y: LS.top, w: LS.safeRight - 130, h: 150, size: 44 } : null,
        chat: {
          x: left,
          y: top,
          scale,
          width: Math.round((LS.safeRight - left) / scale),
          height: Math.round((1920 - top - LS.bottom) / scale),
        },
        fit: "cover",
      };
    }
    const M = MOCKUPS[theme.id] || MOCKUPS.whatsapp;
    const c = M.crop;
    const rel = (r) => ({ x: r.x - c.x, y: r.y - c.y, w: r.w, h: r.h });
    // Chat themes: 12px side inset + the chat's own 12px padding (x1.45)
    // ≈ the real apps' bubble margin to the screen edge.
    const inset = lyrics ? 0 : 12;
    return {
      id: "mockup",
      stageW: c.w,
      stageH: c.h,
      bg: rel(M.bg),
      bgRadius: M.bgRadius || 0,
      chat: {
        x: M.chat.x - c.x + inset,
        y: M.chat.y - c.y,
        scale: MOCKUP_SCALE,
        width: Math.round((M.chat.w - inset * 2) / MOCKUP_SCALE),
        height: Math.round((M.chat.bottom - M.chat.y) / MOCKUP_SCALE),
      },
      chrome: !!M.chrome,
      frame: { asset: M.asset, x: -c.x, y: -c.y, w: M.img[0], h: M.img[1] },
      clock: M.clock ? { ...M.clock, x: M.clock.x - c.x, y: M.clock.y - c.y } : null,
      fit: "contain",
    };
  }

  const px = (n) => n + "px";
  const box = (el, r) => Object.assign(el.style, { position: "absolute", left: px(r.x), top: px(r.y), width: px(r.w), height: px(r.h) });

  class Preview {
    constructor(host, { backgroundSrc, layout = "mockup", theme = "whatsapp", spotifyColor = "rojo" }) {
      this.host = host;
      this.backgroundSrc = backgroundSrc;
      this.theme = WM.Themes.get(theme);
      this.spotifyColor = spotifyColor;
      this.meta = { title: "", artist: "" };
      // Lyrics Pro: where the lyric was dragged, as fractions of the safe area
      this.offset = { x: 0, y: 0 };
      this.guides = null; // { x: bool, y: bool } while dragging
      this.textScale = 1;
      this.font = null; // CSS font-family, or null for the style's own
      this.colors = null; // { ink, accent }, or null for the style's own
      this.timeline = null;
      this.framing = layout;
      new ResizeObserver(() => this.fit()).observe(host);
      this.setLayout(layout);
    }

    setTheme(id) {
      this.theme = WM.Themes.get(id);
      this.setLayout(this.framing);
    }
    /** Can the lyric be dragged around in this style? */
    get draggable() {
      return this.theme.kind === "motion" && this.theme.drag !== false;
    }
    setOffset(o) {
      this.offset = { x: o.x, y: o.y };
    }
    /** Map a pointer movement (CSS px) to safe-area fractions. */
    pointerToOffset(dx, dy) {
      const c = this.motionCanvas;
      if (!c) return { x: 0, y: 0 };
      const r = c.getBoundingClientRect();
      const L = this.layout;
      const k = L.bg.w / (r.width || 1);
      return { x: (dx * k) / L.safe.w, y: (dy * k) / L.safe.h };
    }
    setSpotifyColor(id) {
      this.spotifyColor = id;
      if (this.theme.kind === "lyrics") this.setLayout(this.framing);
    }
    setMeta(meta) {
      this.meta = { ...this.meta, ...meta };
      if (this.headerEl) this.fillHeader();
    }
    get palette() {
      return WM.Themes.spotifyPalette(this.spotifyColor);
    }

    setLayout(framing) {
      this.framing = framing;
      const theme = this.theme;
      const L = (this.layout = layoutFor(framing, theme));
      if (this.stage) this.stage.remove();
      this.host.dataset.layout = L.id;
      this.host.dataset.theme = theme.id;
      this.host.toggleAttribute("data-drag", this.draggable);
      // The preview box keeps the phone's proportions in both framings, so
      // switching never changes its size. "Video final" fills it like
      // object-fit: cover — the exported file is still the full 1080x1920.
      this.host.style.setProperty("--stage-aspect", String(BOX_ASPECT));
      this.host.style.setProperty("--stage-ratio", BOX_ASPECT);

      const stage = (this.stage = document.createElement("div"));
      stage.className = "wm-stage";
      stage.style.width = px(L.stageW);
      stage.style.height = px(L.stageH);

      // 1. Background (Lyrics Pro: the preset's canvas)
      this.motionCanvas = null;
      const bg = document.createElement(L.motion ? "canvas" : "div");
      if (L.motion) this.motionCanvas = bg;
      box(bg, L.bg);
      if (L.bgRadius) bg.style.borderRadius = px(L.bgRadius);
      const b = theme.background;
      if (b.type === "motion") {
        bg.style.background = "#000";
      } else if (b.type === "wallpaper") {
        Object.assign(bg.style, { backgroundImage: `url("${this.backgroundSrc}")`, backgroundSize: "cover", backgroundPosition: "center" });
      } else if (b.type === "solid") {
        bg.style.background = b.color;
      } else {
        const p = this.palette;
        bg.style.background = `linear-gradient(${p.bgTop}, ${p.bgBottom})`;
      }
      stage.appendChild(bg);

      // 2. Title / artist (Spotify, exported framing)
      this.headerEl = null;
      if (L.header) {
        const h = (this.headerEl = document.createElement("div"));
        box(h, L.header);
        Object.assign(h.style, {
          textAlign: "center",
          color: "#fff",
          fontFamily: WM.Themes.LYRICS_FONT,
          lineHeight: "1.35",
          paddingTop: "18px",
          boxSizing: "border-box",
        });
        h.innerHTML = `<b style="display:block;font-size:${L.header.size}px"></b><span style="display:block;font-size:${Math.round(L.header.size * 0.88)}px;opacity:.9"></span>`;
        stage.appendChild(h);
        this.fillHeader();
      }

      // 3. Content: scaled wrapper + fixed viewport that clips overflow.
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
      // Breathing room under the header / title: Spotify's first line
      // starts below the top fade; chats open with a date line ("Hoy").
      this.content.style.padding =
        theme.kind === "lyrics" ? "56px 0 0" : "24px 12px 0";
      viewport.appendChild(this.content);
      scaler.appendChild(viewport);
      stage.appendChild(scaler);

      // 3b. Spotify: lines scrolling up fade out instead of being cut.
      this.fade = null;
      if (theme.kind === "lyrics") {
        const pos = (L.chat.y - L.bg.y) / L.bg.h;
        const fade = (this.fade = { x: L.bg.x, y: L.chat.y, w: L.bg.w, h: 60, pos });
        const f = document.createElement("div");
        box(f, fade);
        const p = this.palette;
        f.style.background = `linear-gradient(${p.at(pos)}, ${p.at(pos + 60 / L.bg.h, 0)})`;
        f.style.pointerEvents = "none";
        stage.appendChild(f);
      }

      // 4. App UI drawn in HTML (non-WhatsApp mockups)
      this.chrome = null;
      if (L.chrome) {
        this.chrome = L.chrome === "status" ? WM.Chrome.status(theme.statusInk || "#fff") : WM.Chrome.build(theme);
        this.chrome.nodes.forEach((n) => stage.appendChild(n));
      }

      // 5. Device frame on top (preview only)
      if (L.frame) {
        const frame = document.createElement("img");
        frame.src = WM.ASSETS[L.frame.asset];
        frame.alt = "";
        box(frame, L.frame);
        // The frame is deliberately wider than the cropped stage; hosts
        // that reset img { max-width: 100% } (the claude.ai viewer does)
        // would squash it out of line with the content.
        frame.style.maxWidth = "none";
        frame.style.maxHeight = "none";
        frame.style.pointerEvents = "none";
        stage.appendChild(frame);
      }

      // 6. Real time over the time baked into the mockup's status bar.
      this.clockEl = null;
      if (L.clock) {
        const k = L.clock;
        const t = (this.clockEl = document.createElement("div"));
        box(t, { x: k.x - 6, y: k.y - 8, w: k.w + 18, h: k.h + 16 });
        Object.assign(t.style, {
          background: k.bg,
          color: "#fff",
          fontFamily: WM.Themes.FONT_STACK,
          fontWeight: String(k.weight),
          fontSize: Math.round(k.h * 1.36) + "px",
          lineHeight: k.h + 16 + "px",
          paddingLeft: "6px",
          boxSizing: "border-box",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        });
        t.textContent = WM.clockNow();
        stage.appendChild(t);
      }

      this.host.appendChild(stage);
      this.fit();
      this.setTimeline(this.timeline);
    }

    /** Lyrics Pro: draw the preset into the screen canvas at display resolution. */
    renderMotion(t, playing) {
      const L = this.layout;
      const c = this.motionCanvas;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const scale = Math.max(0.2, (this.k || 1) * dpr);
      const w = Math.max(2, Math.round(L.bg.w * scale));
      const h = Math.max(2, Math.round(L.bg.h * scale));
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      const preset = WM.Presets.get(this.theme.preset);
      // timeline may be re-timed in place by the manual adjust; the word
      // mode depends on the style (and the user's choice)
      const mode = WM.Motion.modeFor(preset);
      if (this.linesFor !== this.timeline || this.linesMode !== mode) {
        this.linesFor = this.timeline;
        this.linesMode = mode;
        this.lines = WM.Motion.prepare(this.timeline, mode);
      }
      const g = c.getContext("2d");
      g.setTransform(w / L.bg.w, 0, 0, h / L.bg.h, 0, 0);
      preset.draw(g, WM.Motion.frame({ lines: this.lines, t, W: L.bg.w, H: L.bg.h, safe: L.safe, energy: WM.Energy.current, mockup: L.id === "mockup", meta: this.meta, offset: this.draggable ? this.offset : null, video: this.theme.video ? WM.BgVideo.at(t, playing) : null, textScale: this.textScale, font: this.font, colors: this.theme.colors === false ? null : this.colors }));
      if (this.guides) this.drawGuides(g, L);
    }

    /** Preview only: safe area and the centre lines the lyric snaps to. */
    drawGuides(g, L) {
      const s = L.safe;
      const u = s.w / 825;
      g.save();
      g.setLineDash([u * 10, u * 8]);
      g.lineWidth = Math.max(1, u * 2);
      g.strokeStyle = "rgba(255,255,255,0.45)";
      g.strokeRect(s.x, s.y, s.w, s.h);
      g.setLineDash([]);
      g.lineWidth = Math.max(1, u * 3);
      g.strokeStyle = "#ff2d78";
      g.shadowColor = "rgba(0,0,0,0.5)";
      g.shadowBlur = 4;
      g.beginPath();
      if (this.guides.x) {
        g.moveTo(s.x + s.w / 2, 0);
        g.lineTo(s.x + s.w / 2, L.bg.h);
      }
      if (this.guides.y) {
        g.moveTo(0, s.y + s.h / 2);
        g.lineTo(L.bg.w, s.y + s.h / 2);
      }
      g.stroke();
      g.restore();
    }

    fillHeader() {
      const [t, a] = this.headerEl.children;
      t.textContent = this.meta.title || "";
      a.textContent = this.meta.artist || "";
    }

    fit() {
      if (!this.stage) return;
      const r = this.host.getBoundingClientRect();
      const fx = r.width / this.layout.stageW;
      const fy = r.height / this.layout.stageH;
      const k = (this.k = this.layout.fit === "contain" ? Math.min(fx, fy) : Math.max(fx, fy));
      this.stage.style.transform = `translate(-50%, -50%) scale(${k})`;
    }

    /** Build one item (bubble or lyric line) per lyric line. */
    setTimeline(timeline) {
      this.timeline = timeline;
      if (this.theme.kind === "motion") {
        this.bubbles = [];
        this.host.classList.toggle("is-empty", !(timeline && timeline.entries.length));
        return;
      }
      this.content.innerHTML = "";
      this.bubbles = [];
      this.bottoms = null;
      const entries = timeline ? timeline.entries : [];
      this.host.classList.toggle("is-empty", !entries.length);
      if (!entries.length) return;
      const theme = this.theme;

      if (theme.kind === "lyrics") {
        entries.forEach((e, i) => {
          const line = WM.Bubbles.createLyricLine({ text: e.text, theme, marginTop: i === 0 ? 0 : theme.lyrics.gap });
          this.content.appendChild(line.root);
          this.bubbles.push(line);
        });
        return;
      }
      // Real time: the first message carries the current time and the
      // rest advance with the song.
      const now = new Date();
      const base = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() - entries[0].start;
      const clockAt = (t) => clockFor(base + t);
      if (theme.bubble === "whatsapp") this.content.appendChild(WM.Bubbles.createHoyPill("Hoy"));
      if (theme.bubble !== "whatsapp") this.content.appendChild(WM.Bubbles.createChatDate("Hoy " + clockAt(entries[0].start)));
      entries.forEach((e, i) => {
        const from = e.from || "me";
        const prevFrom = i > 0 ? entries[i - 1].from || "me" : from;
        const b =
          theme.bubble === "flat"
            ? WM.Bubbles.createFlatBubble({ text: e.text, theme, marginTop: i === 0 ? 0 : theme.flat.gap })
            : WM.Bubbles.createBubble({
                text: e.text,
                from,
                clock: clockAt(e.start),
                marginTop: i === 0 ? 0 : prevFrom !== from ? SENDER_CHANGE_GAP : SAME_SENDER_GAP,
              });
        this.content.appendChild(b.root);
        this.bubbles.push(b);
      });
    }

    // Item boxes inside the content, measured once with everything laid
    // out (layout never changes afterwards, only opacity/transform) —
    // same approach as AutoScrollChatLog.
    measure() {
      const lyrics = this.theme.kind === "lyrics";
      if (!lyrics) this.bubbles.forEach((b) => (b.root.style.display = "flex"));
      this.tops = this.bubbles.map((b) => b.root.offsetTop);
      this.bottoms = this.bubbles.map((b) => b.root.offsetTop + b.root.offsetHeight);
      const first = this.content.firstChild;
      this.pillBottom = lyrics ? 0 : first.offsetTop + first.offsetHeight;
      if (!lyrics) this.bubbles.forEach((b) => b.reset());
    }

    /** How far the content is moved up so item `index` (-1 = none yet) is in place. */
    scrollFor(index) {
      if (!this.bottoms) return 0;
      const h = this.layout.chat.height;
      if (this.theme.kind === "lyrics") {
        return index >= 0 ? Math.max(0, this.tops[index] - h * LYRIC_ANCHOR) : 0;
      }
      const bottom = index >= 0 ? this.bottoms[index] : this.pillBottom;
      return Math.max(0, bottom - h + BOTTOM_PADDING);
    }

    /**
     * Pure function of the sync state, so seeking renders the exact frame.
     * @param opts { playing, time, duration }
     * @returns {{ scroll:number, looks:object[] }} what was drawn, for the
     *   video renderer
     */
    render(state, { playing = false, time = state.time, duration = 0 } = {}) {
      if (this.chrome) this.chrome.update({ time, duration, playing, ...this.meta });
      if (this.motionCanvas) {
        this.renderMotion(time, playing);
        return { scroll: 0, looks: [] };
      }
      if (this.clockEl) {
        const now = WM.clockNow();
        if (this.clockEl.textContent !== now) this.clockEl.textContent = now;
      }
      if (!this.bubbles.length) return { scroll: 0, looks: [] };
      if (!this.bottoms) this.measure();

      // Scroll glides from the previous item's position to the newest
      // one's, keyed off the newest line's start.
      const last = state.visibleCount - 1;
      const ease = last >= 0 ? Math.min(scrollSpring(state.entries[last].age), 1) : 0;
      const prev = this.scrollFor(last - 1);
      const next = this.scrollFor(last);
      const scroll = prev + (next - prev) * ease;
      this.content.style.transform = `translateY(${-scroll}px)`;

      const theme = this.theme;
      const H = this.layout.chat.height;
      let looks;
      if (theme.kind === "lyrics") {
        const p = this.palette;
        looks = state.entries.map((s, i) =>
          this.bubbles[i].update({ age: s.age, active: i === state.activeIndex, color: p.line, activeColor: "#ffffff" }),
        );
      } else if (theme.bubble === "flat") {
        const f = theme.flat;
        looks = state.entries.map((s, i) => {
          const y0 = (this.tops[i] - scroll) / H;
          const y1 = (this.bottoms[i] - scroll) / H;
          return this.bubbles[i].update({
            age: s.age,
            active: i === state.activeIndex,
            fill: [WM.Themes.gradientAt(f.stops, y0), WM.Themes.gradientAt(f.stops, y1)],
            // one group: inner corners tighten on the right-hand side
            corners: [i > 0 ? f.tight : f.radius, i < last ? f.tight : f.radius],
          });
        });
      } else {
        looks = state.entries.map((s, i) => this.bubbles[i].update({ age: s.age, active: i === state.activeIndex, playing }));
      }
      return { scroll, looks };
    }
  }

  /** "HH:MM" for a time of day given in seconds since midnight. */
  function clockFor(seconds) {
    const mins = Math.floor(seconds / 60);
    return String(Math.floor(mins / 60) % 24).padStart(2, "0") + ":" + String(((mins % 60) + 60) % 60).padStart(2, "0");
  }
  WM.clockNow = () => {
    const d = new Date();
    return clockFor(d.getHours() * 3600 + d.getMinutes() * 60);
  };

  WM.Preview = Preview;
})((window.WaveMusic = window.WaveMusic || {}));
