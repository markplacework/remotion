// Wave Music · RENDER DE VIDEO
// Paints the "Video final" framing (1080x1920: background + lyrics in the
// chosen style, never the mockup) onto a canvas, one frame per call. Layout is not re-invented
// here: an off-screen Preview in the "video" layout lays the bubbles out
// with the real DOM/CSS, we read their boxes once, and every frame reuses
// the Preview's own animation values (entrance spring, scroll).
(function (WM) {
  const { WA, FONT_STACK } = WM.Bubbles;
  const FONT_SIZE = 22; // DarkChatLog default
  const LINE_H = FONT_SIZE * 1.32;
  const TS_SIZE = FONT_SIZE * 0.68;

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("No se pudo cargar el fondo"));
      img.src = src;
    });
  }

  function roundRect(g, x, y, w, h, [tl, tr, br, bl]) {
    g.beginPath();
    g.moveTo(x + tl, y);
    g.lineTo(x + w - tr, y);
    g.quadraticCurveTo(x + w, y, x + w, y + tr);
    g.lineTo(x + w, y + h - br);
    g.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    g.lineTo(x + bl, y + h);
    g.quadraticCurveTo(x, y + h, x, y + h - bl);
    g.lineTo(x, y + tl);
    g.quadraticCurveTo(x, y, x + tl, y);
    g.closePath();
  }

  function brighten(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.min(255, Math.round(v * k)));
    return `rgb(${c.join(",")})`;
  }

  function wrap(g, text, width) {
    const out = [];
    text.split("\n").forEach((para) => {
      let line = "";
      para.split(/\s+/).forEach((word) => {
        const tryLine = line ? line + " " + word : word;
        if (line && g.measureText(tryLine).width > width + 0.5) {
          out.push(line);
          line = word;
        } else line = tryLine;
      });
      out.push(line);
    });
    return out;
  }

  /** The lines exactly as the browser wrapped `el`'s text (so the canvas
   * never breaks a line differently from the preview). */
  function domLines(el) {
    const node = el.firstChild;
    if (!node || node.nodeType !== 3) return [el.textContent];
    const text = node.textContent;
    const range = document.createRange();
    const lines = [];
    let lastTop = null;
    const re = /\S+/g;
    let m;
    while ((m = re.exec(text))) {
      range.setStart(node, m.index);
      range.setEnd(node, m.index + m[0].length);
      const top = Math.round(range.getClientRects()[0].top);
      if (lastTop === null || Math.abs(top - lastTop) > 3) lines.push(m[0]);
      else lines[lines.length - 1] += " " + m[0];
      lastTop = top;
    }
    return lines.length ? lines : [text];
  }

  function fitText(g, text, width) {
    if (g.measureText(text).width <= width) return text;
    let t = text;
    while (t.length > 1 && g.measureText(t + "…").width > width) t = t.slice(0, -1);
    return t + "…";
  }

  class VideoRenderer {
    /** Use create(): it waits for the background image. */
    constructor(timeline, bg, style = {}) {
      this.timeline = timeline;
      this.bg = bg;
      this.theme = WM.Themes.get(style.theme);
      this.canvas = document.createElement("canvas");
      this.canvas.width = 1080;
      this.canvas.height = 1920;
      this.g = this.canvas.getContext("2d");

      // Off-screen Preview in the exported framing, for layout + animation.
      this.host = document.createElement("div");
      Object.assign(this.host.style, {
        position: "fixed",
        left: "-20000px",
        top: "0",
        width: "1080px",
        height: "1920px",
        opacity: "0",
        pointerEvents: "none",
      });
      document.body.appendChild(this.host);
      this.preview = new WM.Preview(this.host, {
        backgroundSrc: bg ? bg.src : "",
        layout: "video",
        theme: this.theme.id,
        spotifyColor: style.spotifyColor,
      });
      this.preview.setMeta(style.meta || {});
      this.preview.setTimeline(timeline);
      this.L = this.preview.layout;
      this.measure();
    }

    static async create(timeline, backgroundSrc, style = {}) {
      const theme = WM.Themes.get(style.theme);
      if (theme.kind === "motion") {
        await WM.Presets.loadFonts(style.font);
        return new MotionRenderer(timeline, theme, style);
      }
      const bg = theme.background.type === "wallpaper" ? await loadImage(backgroundSrc) : null;
      if (theme.kind === "lyrics" && document.fonts) {
        await document.fonts.load(`700 40px ${WM.Themes.LYRICS_FONT}`).catch(() => {});
      }
      return new VideoRenderer(timeline, bg, style);
    }

    measure() {
      const g = this.g;
      const content = this.preview.content;
      const bubbles = this.preview.bubbles;
      const scale = this.L.chat.scale;
      content.style.transform = "";
      bubbles.forEach((b) => (b.root.style.display = "flex"));
      // Boxes in the chat's own (pre-scale) coordinates, relative to the
      // clipping viewport — the same space the canvas draws in.
      const origin = content.parentElement.getBoundingClientRect();
      const box = (el) => {
        const r = el.getBoundingClientRect();
        return {
          x: (r.left - origin.left) / scale,
          y: (r.top - origin.top) / scale,
          w: r.width / scale,
          h: r.height / scale,
        };
      };
      if (this.theme.kind === "lyrics") {
        const Ly = this.theme.lyrics;
        g.font = `700 ${Ly.fontSize}px ${WM.Themes.LYRICS_FONT}`;
        this.lineH = Ly.fontSize * Ly.lineHeight;
        this.items = bubbles.map((b, i) => ({
          row: box(b.root),
          lines: domLines(b.root),
        }));
        return;
      }
      if (this.theme.bubble === "flat") {
        const f = this.theme.flat;
        g.font = `${f.fontSize}px ${WM.Themes.FONT_STACK}`;
        this.lineH = f.fontSize * 1.3;
        const date = content.firstChild.firstChild;
        this.dateLabel = { ...box(date), text: date.textContent };
        this.items = bubbles.map((b, i) => {
          const cs = getComputedStyle(b.box);
          const pl = parseFloat(cs.paddingLeft);
          const pt = parseFloat(cs.paddingTop);
          const bx = box(b.box);
          return {
            row: box(b.root),
            box: bx,
            text: { x: bx.x + pl, y: bx.y + pt },
            lines: domLines(b.box),
          };
        });
        bubbles.forEach((b) => b.reset());
        return;
      }
      const pill = content.firstChild.firstChild;
      this.pill = { ...box(pill), text: pill.textContent };
      g.font = `${FONT_SIZE}px ${FONT_STACK}`;
      this.items = bubbles.map((b, i) => {
        const rowEl = b.root;
        const boxEl = rowEl.firstChild;
        const [textEl, metaEl] = boxEl.children;
        const row = box(rowEl);
        const text = box(textEl);
        const meta = box(metaEl);
        return {
          row,
          box: box(boxEl),
          text,
          meta: { right: meta.x + meta.w, cy: meta.y + meta.h / 2 },
          lines: wrap(g, this.timeline.entries[i].text, textEl.clientWidth),
          clock: metaEl.querySelector("span:not(.wm-eq)").textContent,
        };
      });
      bubbles.forEach((b) => b.reset());
    }

    /** Paint the frame for time `t` (seconds) given a sync state. */
    draw(t, state) {
      const g = this.g;
      const L = this.L;
      const { scroll, looks } = this.preview.render(state, { playing: true, time: t });
      const theme = this.theme;

      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalAlpha = 1;
      if (theme.background.type === "wallpaper") {
        // wallpaper, object-fit: cover
        const { width: iw, height: ih } = this.bg;
        const k = Math.max(L.stageW / iw, L.stageH / ih);
        g.drawImage(this.bg, (L.stageW - iw * k) / 2, (L.stageH - ih * k) / 2, iw * k, ih * k);
      } else if (theme.background.type === "solid") {
        g.fillStyle = theme.background.color;
        g.fillRect(0, 0, L.stageW, L.stageH);
      } else {
        const p = this.preview.palette;
        const grad = g.createLinearGradient(0, 0, 0, L.stageH);
        grad.addColorStop(0, p.bgTop);
        grad.addColorStop(1, p.bgBottom);
        g.fillStyle = grad;
        g.fillRect(0, 0, L.stageW, L.stageH);
      }
      if (L.header) this.drawHeader(L.header);

      // chat viewport: same origin, scale and clip as the DOM
      g.save();
      g.translate(L.chat.x, L.chat.y);
      g.scale(L.chat.scale, L.chat.scale);
      g.beginPath();
      g.rect(0, 0, L.chat.width, L.chat.height);
      g.clip();
      g.translate(0, -scroll);

      if (theme.kind === "lyrics") {
        const p = this.preview.palette;
        this.items.forEach((it, i) => looks[i] && this.drawLyric(it, looks[i], p));
      } else if (theme.bubble === "flat") {
        const d = this.dateLabel;
        g.fillStyle = "#a8a8a8";
        g.font = `14px ${WM.Themes.FONT_STACK}`;
        g.textBaseline = "middle";
        g.fillText(d.text, d.x, d.y + d.h / 2);
        this.items.forEach((it, i) => looks[i] && looks[i].visible && this.drawFlat(it, looks[i]));
      } else {
        this.drawPill();
        this.items.forEach((it, i) => looks[i] && looks[i].visible && this.drawBubble(it, looks[i], t));
      }
      g.restore();
      const fade = this.preview.fade;
      if (fade) {
        const p = this.preview.palette;
        const grad = g.createLinearGradient(0, fade.y, 0, fade.y + fade.h);
        grad.addColorStop(0, p.at(fade.pos));
        grad.addColorStop(1, p.at(fade.pos + fade.h / L.bg.h, 0));
        g.fillStyle = grad;
        g.fillRect(fade.x, fade.y, fade.w, fade.h);
      }
      return this.canvas;
    }

    drawHeader(h) {
      const g = this.g;
      const { title, artist } = this.preview.meta;
      g.save();
      g.fillStyle = "#fff";
      g.textAlign = "center";
      g.textBaseline = "top";
      const cx = h.x + h.w / 2;
      g.font = `700 ${h.size}px ${WM.Themes.LYRICS_FONT}`;
      g.fillText(fitText(g, title || "", h.w), cx, h.y + 18);
      g.globalAlpha = 0.9;
      g.font = `${Math.round(h.size * 0.88)}px ${WM.Themes.LYRICS_FONT}`;
      g.fillText(fitText(g, artist || "", h.w), cx, h.y + 18 + h.size * 1.35);
      g.restore();
    }

    drawLyric(it, look, p) {
      const g = this.g;
      const Ly = this.theme.lyrics;
      g.save();
      const oy = it.row.y + it.row.h / 2;
      g.translate(it.row.x, oy);
      g.scale(look.scale, look.scale);
      g.translate(-it.row.x, -oy);
      g.fillStyle = look.active ? "#ffffff" : p.line;
      g.font = `700 ${Ly.fontSize}px ${WM.Themes.LYRICS_FONT}`;
      if ("letterSpacing" in g) g.letterSpacing = `${-0.01 * Ly.fontSize}px`; // as the CSS
      g.textBaseline = "middle";
      it.lines.forEach((line, n) => g.fillText(line, it.row.x, it.row.y + n * this.lineH + this.lineH / 2));
      g.restore();
    }

    drawFlat(it, look) {
      const g = this.g;
      const f = this.theme.flat;
      g.save();
      g.globalAlpha = look.opacity;
      const ox = it.row.x + it.row.w;
      const oy = it.row.y;
      g.translate(ox, oy + look.ty);
      g.scale(look.scale, look.scale);
      g.translate(-ox, -oy);
      const b = it.box;
      const cap = (r) => Math.min(r, b.h / 2);
      roundRect(g, b.x, b.y, b.w, b.h, [cap(f.radius), cap(look.corners[0]), cap(look.corners[1]), cap(f.radius)]);
      const grad = g.createLinearGradient(0, b.y, 0, b.y + b.h);
      grad.addColorStop(0, look.fill[0]);
      grad.addColorStop(1, look.fill[1]);
      g.fillStyle = grad;
      if (look.active) g.filter = "brightness(1.1)";
      g.fill();
      g.filter = "none";
      g.fillStyle = f.text;
      g.font = `${f.fontSize}px ${WM.Themes.FONT_STACK}`;
      g.textBaseline = "middle";
      it.lines.forEach((line, n) => g.fillText(line, it.text.x, it.text.y + n * this.lineH + this.lineH / 2));
      g.restore();
    }

    drawPill() {
      const g = this.g;
      const p = this.pill;
      roundRect(g, p.x, p.y, p.w, p.h, [7, 7, 7, 7]);
      g.fillStyle = "rgba(24, 34, 41, 0.92)";
      g.fill();
      g.fillStyle = WA.timestamp;
      g.font = `600 15px ${FONT_STACK}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(p.text, p.x + p.w / 2, p.y + p.h / 2 + 0.5);
      g.textAlign = "left";
    }

    drawBubble(it, look, t) {
      const g = this.g;
      g.save();
      g.globalAlpha = look.opacity;
      // transform-origin: top right of the row (outgoing bubbles)
      const ox = it.row.x + it.row.w;
      const oy = it.row.y;
      g.translate(ox, oy + look.ty);
      g.scale(look.scale, look.scale);
      g.translate(-ox, -oy);

      const b = it.box;
      roundRect(g, b.x, b.y, b.w, b.h, [14, 3, 14, 14]);
      g.fillStyle = look.active ? brighten(WA.bubbleOut, 1.12) : WA.bubbleOut;
      g.fill();

      g.fillStyle = look.active ? brighten(WA.text, 1.0) : WA.text;
      g.font = `${FONT_SIZE}px ${FONT_STACK}`;
      g.textBaseline = "middle";
      it.lines.forEach((line, n) => g.fillText(line, it.text.x, it.text.y + n * LINE_H + LINE_H / 2));

      // meta row, right-aligned: [eq] clock ticks
      const th = TS_SIZE;
      const tw = (th * 18) / 13;
      let x = it.meta.right - tw;
      this.drawTicks(x, it.meta.cy - th / 2, th);
      g.font = `${TS_SIZE}px ${FONT_STACK}`;
      g.fillStyle = WA.timestamp;
      const cw = g.measureText(it.clock).width;
      x -= 6 + cw;
      g.fillText(it.clock, x, it.meta.cy + 0.5);
      if (look.active) this.drawEq(x - 6 - 3, it.meta.cy, t);
      g.restore();
    }

    drawTicks(x, y, h) {
      const g = this.g;
      const s = h / 13;
      g.save();
      g.translate(x, y);
      g.scale(s, s);
      g.strokeStyle = WA.readTick;
      g.lineWidth = 1.6;
      g.lineCap = "round";
      g.lineJoin = "round";
      g.beginPath();
      g.moveTo(1, 6.8);
      g.lineTo(4.6, 10.4);
      g.lineTo(11, 3.6);
      g.moveTo(6.3, 6.8);
      g.lineTo(9.9, 10.4);
      g.lineTo(17, 3.6);
      g.stroke();
      g.restore();
    }

    // Same "now playing" bars as the CSS .wm-eq animation (0.9 s loop).
    drawEq(right, cy, t) {
      const g = this.g;
      const H = 11;
      g.fillStyle = "#22d3f5";
      [0, -0.3, -0.6].forEach((delay, n) => {
        const ph = (((t - delay) / 0.9) % 1 + 1) % 1;
        const k = 0.35 + 0.65 * (0.5 - 0.5 * Math.cos(ph * 2 * Math.PI));
        const x = right - 11.5 + n * 4.5;
        g.fillRect(x, cy + H / 2 - H * k, 2.5, H * k);
      });
    }

    dispose() {
      this.host.remove();
    }
  }

  /**
   * Lyrics Pro: the preset draws straight onto the 1080x1920 canvas with the
   * same frame() the preview uses — the export matches the preview exactly.
   */
  class MotionRenderer {
    constructor(timeline, theme, style) {
      this.preset = WM.Presets.get(theme.preset);
      this.lines = WM.Motion.prepare(timeline, WM.Motion.modeFor(this.preset));
      this.meta = style.meta || {};
      this.offset = style.offset || null;
      this.textScale = style.textScale || 1;
      this.font = style.font || null;
      this.video = WM.BgVideo.showsIn(theme) && WM.BgVideo.enabled;
      if (this.video) WM.BgVideo.exporting = true;
      if (WM.Fx) WM.Fx.exporting = true;
      this.canvas = document.createElement("canvas");
      this.canvas.width = 1080;
      this.canvas.height = 1920;
      this.g = this.canvas.getContext("2d");
      this.safe = { x: 140, y: 230, w: 800, h: 1310 }; // = preview.js MOTION_SAFE.video
    }
    /** offline: the frame is drawn exactly at t, the footage seeked to it (not playing). */
    get offline() {
      return true;
    }
    draw(t, state, playing = true) {
      this.g.setTransform(1, 0, 0, 1, 0, 0);
      if (WM.Fx) WM.Fx.sync(t, playing, true);
      this.preset.draw(this.g, WM.Motion.frame({ lines: this.lines, t, W: 1080, H: 1920, safe: this.safe, energy: WM.Energy.current, meta: this.meta, offset: this.offset, video: this.video ? WM.BgVideo.at(t, playing, true) : null, textScale: this.textScale, font: this.font }));
      return this.canvas;
    }
    dispose() {
      if (this.video) WM.BgVideo.exporting = false;
      if (WM.Fx) WM.Fx.exporting = false;
    }
  }

  WM.VideoRenderer = VideoRenderer;
})((window.WaveMusic = window.WaveMusic || {}));
