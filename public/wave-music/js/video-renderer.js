// Wave Music · RENDER DE VIDEO
// Paints the "Video final" framing (1080x1920: wallpaper + chat, never the
// mockup) onto a canvas, one frame per call. Layout is not re-invented
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

  class VideoRenderer {
    /** Use create(): it waits for the background image. */
    constructor(timeline, bg) {
      this.timeline = timeline;
      this.bg = bg;
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
      this.preview = new WM.Preview(this.host, { backgroundSrc: bg.src, layout: "video" });
      this.preview.setTimeline(timeline);
      this.L = this.preview.layout;
      this.measure();
    }

    static async create(timeline, backgroundSrc) {
      const bg = await loadImage(backgroundSrc);
      return new VideoRenderer(timeline, bg);
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
      const { scroll, looks } = this.preview.render(state, { playing: true });

      // wallpaper, object-fit: cover
      const { width: iw, height: ih } = this.bg;
      const k = Math.max(L.stageW / iw, L.stageH / ih);
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalAlpha = 1;
      g.drawImage(this.bg, (L.stageW - iw * k) / 2, (L.stageH - ih * k) / 2, iw * k, ih * k);

      // chat viewport: same origin, scale and clip as the DOM
      g.save();
      g.translate(L.chat.x, L.chat.y);
      g.scale(L.chat.scale, L.chat.scale);
      g.beginPath();
      g.rect(0, 0, L.chat.width, L.chat.height);
      g.clip();
      g.translate(0, -scroll);

      this.drawPill();
      this.items.forEach((it, i) => looks[i] && looks[i].visible && this.drawBubble(it, looks[i], t));
      g.restore();
      return this.canvas;
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

  WM.VideoRenderer = VideoRenderer;
})((window.WaveMusic = window.WaveMusic || {}));
