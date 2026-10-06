// Wave Music · LYRICS PRO (estilos)
// Each preset is one draw(g, f) function over the shared frame from
// motion.js (lines with per-word timing, current line, beat pulse, safe
// area). It is a pure function of time, so the preview, seeking and the
// exported video are identical. Adding a style = adding one entry here.
(function (WM) {
  const { clamp, lerp, ease, rand } = WM.Motion;

  // ---------- shared text helpers ----------
  /** Lay words out in lines no wider than maxW. fontOf(word) -> font. */
  function wrapWords(g, words, fontOf, maxW, spaceW) {
    const lines = [];
    let cur = { items: [], width: 0 };
    words.forEach((w) => {
      g.font = fontOf(w);
      const width = g.measureText(w.label).width;
      const add = (cur.items.length ? spaceW : 0) + width;
      if (cur.items.length && cur.width + add > maxW) {
        lines.push(cur);
        cur = { items: [], width: 0 };
      }
      cur.items.push({ w, width, x: cur.width + (cur.items.length ? spaceW : 0) });
      cur.width += cur.items.length > 1 ? add : width;
    });
    if (cur.items.length) lines.push(cur);
    return lines;
  }

  /** Words grouped into stacked rows: short words ride with the next one. */
  function stackRows(words) {
    const rows = [];
    let pending = [];
    words.forEach((w, i) => {
      pending.push(w);
      const short = w.text.replace(/[^\p{L}\p{N}]/gu, "").length <= 3;
      if (!short || i === words.length - 1) {
        rows.push(pending);
        pending = [];
      }
    });
    if (pending.length) rows.push(pending);
    return rows;
  }
  const upper = (s) => s.toLocaleUpperCase("es");
  const longestIndex = (words) => {
    let best = 0;
    words.forEach((w, i) => {
      if (w.text.length > words[best].text.length) best = i;
    });
    return best;
  };

  // ======================================================================
  // 1. KINETIC BOLD — the words are the show
  // ======================================================================
  const KINETIC_COLORS = ["#ffe14d", "#ff4d6d", "#4de1ff", "#b8ff4d"];
  const kinetic = {
    id: "kinetic",
    label: "Kinetic Bold",
    tag: "Energía",
    fonts: ["400 100px Anton"],
    draw(g, f) {
      const { W, H, t, safe } = f;
      const u = safe.w / 825;
      const L = f.lines[f.current];
      const accent = KINETIC_COLORS[Math.max(0, f.current) % KINETIC_COLORS.length];
      const pulse = f.pulse();

      // background: near-black with a slow colour bloom that breathes on the beat
      g.fillStyle = "#08080c";
      g.fillRect(0, 0, W, H);
      const bx = W * (0.5 + 0.25 * Math.sin(t * 0.21));
      const by = H * (0.42 + 0.12 * Math.cos(t * 0.17));
      const bloom = g.createRadialGradient(bx, by, 0, bx, by, H * 0.62);
      bloom.addColorStop(0, hexA(accent, 0.2 + 0.18 * pulse));
      bloom.addColorStop(1, hexA(accent, 0));
      g.fillStyle = bloom;
      g.fillRect(0, 0, W, H);

      if (!L) return;
      // camera shake on hits
      const shake = u * 9 * pulse;
      g.save();
      g.translate((rand(Math.floor(t * 30)) - 0.5) * shake, (rand(Math.floor(t * 30) + 7) - 0.5) * shake);

      // outgoing line flies past the camera
      const prev = f.lines[f.current - 1];
      const out = t - L.start;
      if (prev && out < 0.32) this.drawLine(g, f, prev, u, { exit: out / 0.32, accent: KINETIC_COLORS[(f.current - 1) % KINETIC_COLORS.length] });
      this.drawLine(g, f, L, u, { accent, pulse });
      g.restore();
    },
    drawLine(g, f, line, u, o) {
      const { t, safe } = f;
      const rows = stackRows(line.words);
      const hero = longestIndex(line.words);
      const spec = rows.map((ws) => {
        const label = upper(ws.map((w) => w.text).join(" "));
        g.font = "400 100px Anton, Impact, sans-serif";
        const w100 = g.measureText(label).width || 1;
        const isHero = ws.some((w) => w.index === hero);
        const size = Math.min(u * (isHero ? 250 : 190), (100 * safe.w * 0.88) / w100);
        return { ws, label, size, isHero, t0: ws[0].t0 };
      });
      const gap = u * 6;
      let total = spec.reduce((a, r) => a + r.size * 0.98 + gap, -gap);
      const maxH = safe.h * 0.86;
      const k = total > maxH ? maxH / total : 1;
      total *= k;
      let y = safe.y + (safe.h - total) / 2;
      const cx = safe.x + safe.w / 2;
      g.textAlign = "center";
      g.textBaseline = "middle";
      spec.forEach((r, i) => {
        const size = r.size * k;
        const rowY = y + (size * 0.98) / 2;
        y += size * 0.98 + gap * k;
        let alpha;
        let scale;
        let rot;
        let dx = 0;
        let dy = 0;
        if (o.exit != null) {
          const e = ease.out(o.exit);
          alpha = 1 - o.exit;
          scale = 1 + 0.35 * e;
          rot = 0;
          dy = -u * 60 * e;
        } else {
          const a = (t - r.t0) / 0.3;
          if (a < 0) return;
          const b = ease.back(a);
          alpha = clamp(a * 4);
          scale = lerp(1.75, 1, b) * (1 + 0.04 * (o.pulse || 0));
          rot = (rand(line.index * 31 + i) - 0.5) * 0.16 * (1 - ease.out(a));
          dx = (rand(line.index * 17 + i) - 0.5) * u * 80 * (1 - ease.out(a));
        }
        g.save();
        g.globalAlpha = alpha;
        g.translate(cx + dx, rowY + dy);
        g.rotate(rot);
        g.scale(scale, scale);
        g.font = `400 ${size}px Anton, Impact, sans-serif`;
        g.shadowColor = "rgba(0,0,0,0.45)";
        g.shadowBlur = u * 24;
        g.fillStyle = r.isHero ? o.accent : "#ffffff";
        g.fillText(r.label, 0, 0);
        g.restore();
      });
    },
  };

  // ======================================================================
  // 2. CINEMATIC — a music-video scene, the lyric is part of it
  // ======================================================================
  let grain = null;
  function grainTile() {
    if (grain) return grain;
    grain = document.createElement("canvas");
    grain.width = grain.height = 192;
    const c = grain.getContext("2d");
    const img = c.createImageData(192, 192);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = rand(i * 0.37) * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    return grain;
  }
  const cinematic = {
    id: "cinematic",
    label: "Cinematic",
    tag: "Videoclip",
    fonts: ["500 100px 'Cormorant Garamond'", "italic 500 100px 'Cormorant Garamond'", "600 100px 'Cormorant Garamond'"],
    draw(g, f) {
      const { W, H, t, safe } = f;
      const u = safe.w / 825;
      // night scene: deep blue to warm street light at the bottom
      const sky = g.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#04060c");
      sky.addColorStop(0.55, "#0b1822");
      sky.addColorStop(1, "#24130c");
      g.fillStyle = sky;
      g.fillRect(0, 0, W, H);

      // out-of-focus city lights, slow parallax drift + gentle zoom
      const zoom = 1 + 0.06 * Math.sin(t * 0.05);
      g.save();
      g.translate(W / 2, H / 2);
      g.scale(zoom, zoom);
      g.translate(-W / 2, -H / 2);
      g.globalCompositeOperation = "lighter";
      for (let i = 0; i < 22; i++) {
        const warm = rand(i * 3.1) > 0.45;
        const depth = 0.4 + rand(i * 5.7) * 0.6;
        const r = (u * 60 + rand(i * 2.3) * u * 150) * depth;
        const x = ((rand(i * 7.7) * 1.4 - 0.2) * W + Math.sin(t * 0.07 * depth + i) * u * 70) % (W * 1.2);
        const y = H * (0.2 + rand(i * 9.1) * 0.75) + Math.cos(t * 0.05 + i) * u * 30;
        const a = (0.1 + 0.16 * depth) * (0.75 + 0.25 * Math.sin(t * 0.6 + i * 1.3));
        const col = warm ? [255, 168, 92] : [96, 196, 255];
        const grd = g.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, `rgba(${col},${a})`);
        grd.addColorStop(0.7, `rgba(${col},${a * 0.55})`);
        grd.addColorStop(1, `rgba(${col},0)`);
        g.fillStyle = grd;
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
      }
      // light leak from the corner
      const leak = g.createRadialGradient(W * 0.95, H * 0.08, 0, W * 0.95, H * 0.08, H * 0.5);
      leak.addColorStop(0, `rgba(255,120,60,${0.16 + 0.06 * Math.sin(t * 0.3)})`);
      leak.addColorStop(1, "rgba(255,120,60,0)");
      g.fillStyle = leak;
      g.fillRect(0, 0, W, H);
      g.restore();

      this.drawLyric(g, f, u);

      // vignette, grain and letterbox
      const vig = g.createRadialGradient(W / 2, H * 0.5, H * 0.25, W / 2, H * 0.5, H * 0.75);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.7)");
      g.fillStyle = vig;
      g.fillRect(0, 0, W, H);
      g.save();
      g.globalAlpha = 0.07;
      const tile = grainTile();
      const ox = Math.floor(rand(Math.floor(t * 24)) * 192);
      const oy = Math.floor(rand(Math.floor(t * 24) + 3) * 192);
      g.translate(-ox, -oy);
      g.fillStyle = g.createPattern(tile, "repeat");
      g.fillRect(0, 0, W + 192, H + 192);
      g.restore();
      const bar = H * 0.055;
      g.fillStyle = "#000";
      g.fillRect(0, 0, W, bar);
      g.fillRect(0, H - bar, W, bar);
    },
    drawLyric(g, f, u) {
      const { t, safe } = f;
      const show = (line, alphaMul, lift = 0) => {
        if (!line || alphaMul <= 0) return;
        // the loud parts of the song get the big, spaced capitals
        let e = 0;
        for (let k = 0; k < 6; k++) e += f.energy(line.start + ((line.end - line.start) * k) / 6);
        // louder than the song's own average (and only with a real track)
        const strong = f.energyAvg !== 0.5 && e / 6 > f.energyAvg * 1.18;
        const size = strong ? u * 76 : u * 88;
        const font = strong ? `600 ${size}px 'Cormorant Garamond', Georgia, serif` : `italic 500 ${size}px 'Cormorant Garamond', Georgia, serif`;
        const words = line.words.map((w) => ({ ...w, label: strong ? upper(w.text) : w.text }));
        if ("letterSpacing" in g) g.letterSpacing = strong ? `${size * 0.16}px` : "0px";
        const rows = wrapWords(g, words, () => font, safe.w * 0.86, size * (strong ? 0.5 : 0.28));
        const lh = size * 1.25;
        const cy = safe.y + safe.h * 0.5;
        let y = cy - ((rows.length - 1) * lh) / 2;
        g.textBaseline = "middle";
        g.textAlign = "left";
        g.font = font;
        rows.forEach((row) => {
          const x0 = safe.x + (safe.w - row.width) / 2;
          row.items.forEach((it) => {
            const a = clamp((t - it.w.t0) / 0.7);
            if (a <= 0) return;
            g.save();
            g.globalAlpha = ease.out(a) * alphaMul;
            g.shadowColor = "rgba(255,236,210,0.55)";
            g.shadowBlur = u * 22;
            g.fillStyle = "#f6efe4";
            g.fillText(it.w.label, x0 + it.x, y + lift + u * 16 * (1 - ease.out(a)));
            g.restore();
          });
          y += lh;
        });
        if ("letterSpacing" in g) g.letterSpacing = "0px";
      };
      const L = f.lines[f.current];
      const prev = f.lines[f.current - 1];
      // crossfade: the old line drifts up and dissolves, then the new one rises
      if (L && prev) {
        const e = clamp((t - L.start) / 0.4);
        show(prev, 1 - e, -u * 24 * ease.out(e));
      }
      if (L) show(L, prev ? clamp((t - L.start - 0.25) / 0.35) : 1);
    },
  };

  // ======================================================================
  // 3. NEON / CYBER — night grid, glow and glitch
  // ======================================================================
  const NEON = ["#22e4ff", "#ff2bd6"];
  const neon = {
    id: "neon",
    label: "Neon Cyber",
    tag: "Futurista",
    fonts: ["900 100px Orbitron", "700 100px Orbitron"],
    draw(g, f) {
      const { W, H, t, safe } = f;
      const u = safe.w / 825;
      const pulse = f.pulse();
      const bg = g.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#030008");
      bg.addColorStop(0.62, "#170330");
      bg.addColorStop(1, "#06000f");
      g.fillStyle = bg;
      g.fillRect(0, 0, W, H);

      const hz = H * 0.66;
      // synth sun behind the horizon
      const sunR = W * 0.34;
      g.save();
      g.beginPath();
      g.rect(0, 0, W, hz);
      g.clip();
      const sun = g.createLinearGradient(0, hz - sunR, 0, hz);
      sun.addColorStop(0, "#ffcf3a");
      sun.addColorStop(1, "#ff2bd6");
      g.shadowColor = "#ff2bd6";
      g.shadowBlur = u * 60 * (0.6 + 0.4 * pulse);
      g.fillStyle = sun;
      g.beginPath();
      g.arc(W / 2, hz, sunR, Math.PI, 0);
      g.fill();
      g.shadowBlur = 0;
      g.fillStyle = "#170330";
      for (let i = 0; i < 6; i++) {
        const yy = hz - sunR * 0.12 - i * sunR * 0.13;
        g.fillRect(W / 2 - sunR, yy, sunR * 2, sunR * (0.025 + i * 0.006));
      }
      g.restore();

      // perspective grid moving towards the camera
      g.save();
      g.globalCompositeOperation = "lighter";
      g.strokeStyle = `rgba(255,43,214,${0.45 + 0.35 * pulse})`;
      g.lineWidth = u * 2.2;
      g.beginPath();
      for (let i = -12; i <= 12; i++) {
        g.moveTo(W / 2 + i * u * 14, hz);
        g.lineTo(W / 2 + i * u * 210, H);
      }
      const N = 14;
      for (let i = 0; i < N; i++) {
        const z = ((i + t * 1.2) % N) / N;
        const y = hz + (H - hz) * z * z;
        g.moveTo(0, y);
        g.lineTo(W, y);
      }
      g.stroke();
      // horizon line
      g.strokeStyle = "#22e4ff";
      g.shadowColor = "#22e4ff";
      g.shadowBlur = u * 18;
      g.beginPath();
      g.moveTo(0, hz);
      g.lineTo(W, hz);
      g.stroke();
      g.shadowBlur = 0;
      // floating particles
      for (let i = 0; i < 46; i++) {
        const x = rand(i * 4.3) * W;
        const y = (rand(i * 8.9) * H - t * u * (20 + rand(i) * 40)) % H;
        const yy = y < 0 ? y + H : y;
        const a = 0.3 + 0.7 * Math.abs(Math.sin(t * (0.8 + rand(i * 2) * 2) + i));
        g.fillStyle = `rgba(${i % 2 ? "34,228,255" : "255,43,214"},${a * 0.8})`;
        g.fillRect(x, yy, u * 3, u * 3);
      }
      g.restore();

      const L = f.lines[f.current];
      if (L) {
        const prev = f.lines[f.current - 1];
        const out = t - L.start;
        if (prev && out < 0.25) this.drawLine(g, f, prev, u, hz, { exit: out / 0.25 });
        this.drawLine(g, f, L, u, hz, { pulse });
      }
      // scanlines
      g.fillStyle = "rgba(0,0,0,0.18)";
      for (let y = 0; y < H; y += Math.max(3, u * 5)) g.fillRect(0, y, W, Math.max(1, u * 1.5));
    },
    drawLine(g, f, line, u, hz, o) {
      const { t, safe } = f;
      const rows = stackRows(line.words);
      const spec = rows.map((ws) => {
        const label = upper(ws.map((w) => w.text).join(" "));
        g.font = "900 100px Orbitron, sans-serif";
        const w100 = g.measureText(label).width || 1;
        return { ws, label, size: Math.min(u * 120, (100 * safe.w * 0.9) / w100), t0: ws[0].t0 };
      });
      const top = safe.y + u * 40;
      const bottom = hz - u * 60;
      const gap = u * 26;
      let total = spec.reduce((a, r) => a + r.size + gap, -gap);
      const k = total > bottom - top ? (bottom - top) / total : 1;
      total *= k;
      let y = top + (bottom - top - total) / 2;
      const cx = safe.x + safe.w / 2;
      g.textAlign = "center";
      g.textBaseline = "middle";
      spec.forEach((r, i) => {
        const size = r.size * k;
        const rowY = y + size / 2;
        y += size + gap * k;
        const col = NEON[(line.index + i) % 2];
        let alpha = 1;
        let glitch = 0;
        let scale = 1;
        if (o.exit != null) {
          alpha = 1 - o.exit;
          glitch = 1 - o.exit;
          scale = 1 - 0.08 * o.exit;
        } else {
          const a = (t - r.t0) / 0.18;
          if (a < 0) return;
          // neon tube ignition: flickers on, then stays lit
          if (a < 1 && rand(Math.floor(t * 40) + i * 13) > a) alpha = 0.15;
          glitch = Math.max(clamp(1 - (t - r.t0) / 0.14), o.pulse > 0.75 ? (o.pulse - 0.75) * 2 : 0);
        }
        g.save();
        g.translate(cx, rowY);
        g.scale(scale, scale);
        g.font = `900 ${size}px Orbitron, sans-serif`;
        g.globalAlpha = alpha;
        const glow = 0.6 + 0.4 * (o.pulse || 0);
        if (glitch > 0.05) {
          // RGB split
          g.globalCompositeOperation = "lighter";
          const d = u * 14 * glitch;
          g.fillStyle = "rgba(255,0,80,0.7)";
          g.fillText(r.label, -d, 0);
          g.fillStyle = "rgba(0,200,255,0.7)";
          g.fillText(r.label, d, 0);
          g.globalCompositeOperation = "source-over";
        }
        g.shadowColor = col;
        g.shadowBlur = u * 40 * glow;
        g.lineWidth = u * 4;
        g.strokeStyle = col;
        g.strokeText(r.label, 0, 0);
        g.shadowBlur = u * 14 * glow;
        g.fillStyle = "#ffffff";
        if (glitch > 0.05) {
          // horizontal slice displacement
          for (let s = 0; s < 4; s++) {
            g.save();
            g.beginPath();
            g.rect(-W2(g), -size / 2 + (s * size) / 4, W2(g) * 2, size / 4);
            g.clip();
            g.fillText(r.label, (rand(Math.floor(t * 30) + s * 5 + i) - 0.5) * u * 40 * glitch, 0);
            g.restore();
          }
        } else g.fillText(r.label, 0, 0);
        g.restore();
      });
    },
  };
  const W2 = (g) => g.canvas.width; // generous clip width

  // ======================================================================
  // 4. MINIMAL — typography, space and rhythm
  // ======================================================================
  const MIN = { bg: "#ece8e1", ink: "#16140f", mute: "#8b8173" };
  const SPOTS = [
    { align: "left", x: 0, y: 0.2 },
    { align: "center", x: 0.5, y: 0.47 },
    { align: "right", x: 1, y: 0.72 },
    { align: "left", x: 0, y: 0.56 },
    { align: "center", x: 0.5, y: 0.3 },
  ];
  const minimal = {
    id: "minimal",
    label: "Minimal",
    tag: "Editorial",
    fonts: ["400 100px 'Instrument Serif'", "italic 400 100px 'Instrument Serif'"],
    draw(g, f) {
      const { W, H, t, safe } = f;
      const u = safe.w / 825;
      g.fillStyle = MIN.bg;
      g.fillRect(0, 0, W, H);
      // editorial furniture: title on top, running time at the bottom
      g.fillStyle = MIN.mute;
      g.font = `italic 400 ${u * 30}px 'Instrument Serif', Georgia, serif`;
      g.textBaseline = "alphabetic";
      g.textAlign = "left";
      const meta = f.meta || {};
      if (meta.title) g.fillText(meta.title.toLocaleLowerCase("es"), safe.x, safe.y + u * 10);
      g.textAlign = "right";
      g.fillText(fmt(t), safe.x + safe.w, safe.y + u * 10);
      g.fillRect(safe.x, safe.y + u * 26, safe.w, Math.max(1, u * 1.2));

      const L = f.lines[f.current];
      if (!L) return;
      const prev = f.lines[f.current - 1];
      if (prev) {
        const e = clamp((t - L.start) / 0.7);
        if (e < 1) this.drawLine(g, f, prev, u, 1 - e, -u * 20 * ease.out(e));
      }
      this.drawLine(g, f, L, u, 1, 0);
    },
    drawLine(g, f, line, u, alphaMul, lift) {
      const { t } = f;
      // a little extra margin: editorial layouts breathe
      const safe = { x: f.safe.x + u * 30, y: f.safe.y, w: f.safe.w - u * 60, h: f.safe.h };
      const spot = SPOTS[line.index % SPOTS.length];
      const size = u * 122;
      const hero = longestIndex(line.words);
      const fontOf = (w) => `${w.index === hero ? "italic " : ""}400 ${size}px 'Instrument Serif', Georgia, serif`;
      const words = line.words.map((w) => ({ ...w, label: w.text.toLocaleLowerCase("es") }));
      const rows = wrapWords(g, words, fontOf, safe.w * 0.86, size * 0.26);
      const lh = size * 1.08;
      const blockH = rows.length * lh;
      const top = safe.y + u * 80 + (safe.h - u * 160 - blockH) * spot.y;
      // index number + growing hairline: the line's progress
      g.globalAlpha = alphaMul;
      g.fillStyle = MIN.mute;
      g.font = `italic 400 ${u * 34}px 'Instrument Serif', Georgia, serif`;
      g.textBaseline = "alphabetic";
      const anchorX = spot.align === "left" ? safe.x : spot.align === "right" ? safe.x + safe.w : safe.x + safe.w / 2;
      g.textAlign = spot.align;
      g.fillText(String(line.index + 1).padStart(2, "0"), anchorX, top - u * 26 + lift);
      const prog = clamp((t - line.start) / Math.max(0.5, line.end - line.start));
      const ruleW = u * 150 * ease.out(prog);
      const rx = spot.align === "left" ? safe.x : spot.align === "right" ? safe.x + safe.w - ruleW : safe.x + safe.w / 2 - ruleW / 2;
      g.fillRect(rx, top + blockH + u * 18 + lift, ruleW, Math.max(1, u * 1.4));
      g.textAlign = "left";
      g.textBaseline = "middle";
      rows.forEach((row, ri) => {
        const x0 = spot.align === "left" ? safe.x : spot.align === "right" ? safe.x + safe.w - row.width : safe.x + (safe.w - row.width) / 2;
        const y = top + ri * lh + lh / 2 + lift;
        row.items.forEach((it) => {
          const a = clamp((t - it.w.t0) / 0.75);
          if (a <= 0) return;
          g.globalAlpha = ease.out(a) * alphaMul;
          g.fillStyle = MIN.ink;
          g.font = fontOf(it.w);
          g.fillText(it.w.label, x0 + it.x, y + u * 10 * (1 - ease.out(a)));
        });
      });
      g.globalAlpha = 1;
    },
  };
  // ---------- helpers shared by the styles below ----------
  /** wrapWords, cached: line layouts only change with text, font or width. */
  const wrapCache = new Map();
  function wrapCached(g, key, words, fontOf, maxW, spaceW) {
    let v = wrapCache.get(key);
    if (!v) {
      if (wrapCache.size > 600) wrapCache.clear();
      v = wrapWords(g, words, fontOf, maxW, spaceW);
      wrapCache.set(key, v);
    }
    return v;
  }
  function rrect(g, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }
  /** Progress of a word being sung, 0..1. */
  const sung = (w, t) => clamp((t - w.t0) / Math.max(0.06, w.t1 - w.t0));
  /** Index of the word being sung (or last sung) in a line, -1 before it. */
  function activeWord(line, t) {
    let j = -1;
    line.words.forEach((w, i) => {
      if (w.t0 <= t) j = i;
    });
    return j;
  }

  // ======================================================================
  // 5. KARAOKE — the line fills with colour as it is sung
  // ======================================================================
  const KARA_FONT = (size) => `800 ${size}px Montserrat, 'Arial Black', sans-serif`;
  const karaoke = {
    id: "karaoke",
    label: "Karaoke",
    tag: "Canto",
    fonts: ["800 100px Montserrat"],
    draw(g, f) {
      const { W, H, t, safe } = f;
      const u = safe.w / 825;
      const pulse = f.pulse();
      const en = f.energy();
      const bg = g.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#160828");
      bg.addColorStop(0.55, "#1c0b38");
      bg.addColorStop(1, "#06030d");
      g.fillStyle = bg;
      g.fillRect(0, 0, W, H);
      g.save();
      g.globalCompositeOperation = "lighter";
      // stage lights swinging from the top, brighter on the beat
      for (let i = 0; i < 3; i++) {
        const len = H * 1.05;
        const spread = W * 0.34;
        g.save();
        g.translate(W * (0.18 + 0.32 * i), -H * 0.02);
        g.rotate(Math.sin(t * 0.38 + i * 2.1) * 0.32);
        const col = i === 1 ? "255,61,139" : "124,92,255";
        const gr = g.createLinearGradient(0, 0, 0, len);
        gr.addColorStop(0, `rgba(${col},${0.2 + 0.2 * pulse})`);
        gr.addColorStop(1, `rgba(${col},0)`);
        g.fillStyle = gr;
        g.beginPath();
        g.moveTo(-u * 10, 0);
        g.lineTo(u * 10, 0);
        g.lineTo(spread / 2, len);
        g.lineTo(-spread / 2, len);
        g.closePath();
        g.fill();
        g.restore();
      }
      const fl = g.createRadialGradient(W / 2, H * 1.04, 0, W / 2, H * 1.04, H * 0.5);
      fl.addColorStop(0, `rgba(255,110,70,${0.22 + 0.22 * en})`);
      fl.addColorStop(1, "rgba(255,110,70,0)");
      g.fillStyle = fl;
      g.fillRect(0, 0, W, H);
      for (let i = 0; i < 34; i++) {
        const tw = Math.max(0, Math.sin(t * (0.9 + rand(i) * 2) + i * 7));
        const sz = u * (2 + rand(i * 9) * 3.5);
        g.fillStyle = `rgba(255,255,255,${0.55 * tw * tw})`;
        g.fillRect(rand(i * 3.3) * W - sz / 2, rand(i * 6.1) * H - sz / 2, sz, sz);
      }
      g.restore();
      this.drawLyrics(g, f, u);
    },
    layout(g, line, u, safe) {
      const size = u * 84;
      const words = line.words.map((w) => ({ ...w, label: w.text }));
      const rows = wrapCached(g, `k|${line.index}|${line.text}|${Math.round(size * 10)}|${Math.round(safe.w)}`, words, () => KARA_FONT(size), safe.w * 0.9, size * 0.3);
      return { size, lh: size * 1.2, rows };
    },
    drawLyrics(g, f, u) {
      const { t, safe, lines } = f;
      const cur = f.current;
      const L = lines[cur];
      // the line at the centre slides from the "next" slot into place
      const k = L ? ease.inOut(clamp((t - L.start) / 0.45)) : 1;
      const pos = cur < 0 ? -1 : cur - 1 + k;
      const cx = safe.x + safe.w / 2;
      const cy = safe.y + safe.h * 0.5;
      // stack the lines by their real (scaled) heights around the centre
      const scaleOf = (i) => lerp(0.64, 1, clamp(1 - Math.abs(i - pos)));
      const hOf = (i) => {
        const line = lines[i];
        if (!line || !line.words.length) return this.layout(g, { index: -1, text: "x", words: [] }, u, safe).lh * scaleOf(i);
        const l = this.layout(g, line, u, safe);
        return l.rows.length * l.lh * scaleOf(i);
      };
      const gap = u * 60;
      const A = Math.floor(pos);
      const D = (hOf(A) + hOf(A + 1)) / 2 + gap;
      const ys = { [A]: cy - (pos - A) * D, [A + 1]: cy - (pos - A) * D + D };
      for (let i = A - 1; i >= A - 2; i--) ys[i] = ys[i + 1] - (hOf(i) + hOf(i + 1)) / 2 - gap;
      for (let i = A + 2; i <= A + 3; i++) ys[i] = ys[i - 1] + (hOf(i) + hOf(i - 1)) / 2 + gap;
      g.textBaseline = "middle";
      g.textAlign = "left";
      const grad = g.createLinearGradient(-safe.w / 2, 0, safe.w / 2, 0);
      grad.addColorStop(0, "#ff3d8b");
      grad.addColorStop(0.5, "#ff6a5c");
      grad.addColorStop(1, "#ffb43d");
      for (let i = Math.max(0, Math.floor(pos) - 1); i <= Math.min(lines.length - 1, Math.ceil(pos) + 2); i++) {
        const s = i - pos;
        if (s < -1.6 || s > 2.1) continue;
        const line = lines[i];
        if (!line.words.length) continue;
        const near = clamp(1 - Math.abs(s));
        const scale = lerp(0.64, 1, near);
        const alpha = (s < 0 ? clamp(1 + s * 1.4) : clamp(2 - s)) * lerp(0.4, 1, near);
        if (alpha <= 0.01) continue;
        const { size, lh, rows } = this.layout(g, line, u, safe);
        const y0 = ys[i];
        if (y0 == null) continue;
        g.save();
        g.translate(cx, y0);
        g.scale(scale, scale);
        g.font = KARA_FONT(size);
        const centres = [];
        rows.forEach((row, ri) => {
          const ry = (ri - (rows.length - 1) / 2) * lh;
          row.items.forEach((it) => {
            const x = -row.width / 2 + it.x;
            centres[it.w.index] = { x: x + it.width / 2, y: ry };
            const p = sung(it.w, t);
            const pop = i === f.current ? 1 + 0.07 * Math.sin(Math.PI * p) * (p < 1 ? 1 : 0) : 1;
            g.save();
            g.translate(x + it.width / 2, ry);
            g.scale(pop, pop);
            g.translate(-it.width / 2, 0);
            // unsung: soft white with a dark edge for contrast
            g.globalAlpha = alpha;
            g.lineJoin = "round";
            g.lineWidth = size * 0.1;
            g.strokeStyle = "rgba(10,4,20,0.55)";
            g.strokeText(it.w.label, 0, 0);
            g.fillStyle = "rgba(255,255,255,0.38)";
            g.fillText(it.w.label, 0, 0);
            if (p > 0) {
              g.save();
              if (p < 1) {
                g.beginPath();
                g.rect(-size, -lh, size + it.width * p, lh * 2);
                g.clip();
              }
              // the gradient runs across the whole line, not per word
              g.translate(-x, 0);
              g.fillStyle = grad;
              if (i === f.current) {
                g.shadowColor = "rgba(255,61,139,0.85)";
                g.shadowBlur = size * 0.35;
              }
              g.fillText(it.w.label, x, 0);
              g.restore();
            }
            g.restore();
          });
        });
        if (i === f.current && near > 0.6) this.drawBall(g, f, line, centres, size, alpha);
        g.restore();
      }
      const nx = f.current + 1;
      if (ys[nx] != null) this.drawCountdown(g, f, cx, ys[nx] - hOf(nx) / 2, u);
    },
    /** The classic bouncing ball, landing on every word as it is sung. */
    drawBall(g, f, line, centres, size, alpha) {
      const { t } = f;
      const ws = line.words;
      const j = activeWord(line, t);
      if (j < 0 || !centres[j]) return;
      const last = ws[ws.length - 1];
      const fade = clamp(1 - (t - last.t1 - 0.3) / 0.4);
      if (fade <= 0) return;
      const nx = ws[j + 1] && centres[j + 1] ? j + 1 : j;
      const span = nx !== j ? ws[nx].t0 - ws[j].t0 : Math.max(0.2, last.t1 - ws[j].t0);
      const p = clamp((t - ws[j].t0) / Math.max(0.08, span));
      const a = centres[j];
      const b = centres[nx];
      const hop = Math.sin(Math.PI * p) * size * (nx !== j ? 0.75 : 0.35);
      const x = lerp(a.x, b.x, p);
      const y = lerp(a.y, b.y, p) - size * 0.82 - hop;
      const r = size * 0.13;
      const squash = 1 - 0.3 * clamp(1 - hop / (size * 0.15));
      g.save();
      g.globalAlpha = alpha * fade;
      g.translate(x, y + r * (1 - squash));
      g.scale(1 / squash ** 0.5, squash);
      g.shadowColor = "#ff3d8b";
      g.shadowBlur = size * 0.4;
      const ball = g.createRadialGradient(-r * 0.35, -r * 0.35, 0, 0, 0, r);
      ball.addColorStop(0, "#ffffff");
      ball.addColorStop(1, "#ffb0cf");
      g.fillStyle = ball;
      g.beginPath();
      g.arc(0, 0, r, 0, Math.PI * 2);
      g.fill();
      g.restore();
    },
    /** Three dots counting down to the next line after an instrumental gap. */
    drawCountdown(g, f, cx, yNext, u) {
      const { t, lines } = f;
      const L = lines[f.current];
      const next = lines[f.current + 1];
      if (!next || !next.words.length) return;
      const lastEnd = L && L.words.length ? L.words[L.words.length - 1].t1 : 0;
      const left = next.start - t;
      if (next.start - lastEnd < 3.4 || left > 3 || left <= 0) return;
      const on = Math.ceil(left);
      const y = yNext - u * 44;
      for (let i = 0; i < 3; i++) {
        const lit = i < on;
        g.save();
        g.globalAlpha = lit ? 1 : 0.22;
        g.fillStyle = lit ? "#ffb43d" : "#ffffff";
        if (lit) {
          g.shadowColor = "#ff6a5c";
          g.shadowBlur = u * 18;
        }
        g.beginPath();
        g.arc(cx + (i - 1) * u * 46, y, u * 11 * (lit && i === on - 1 ? 1 + 0.25 * (left % 1) : 1), 0, Math.PI * 2);
        g.fill();
        g.restore();
      }
    },
  };

  // ======================================================================
  // 6. WORD POP — subtitles the way creators edit them (big, word by word)
  // ======================================================================
  const POP_ACCENTS = ["#ffe600", "#3dff8b", "#ff4fa3", "#4fd8ff"];
  const POP_FONT = (size) => `900 ${size}px Poppins, 'Arial Black', sans-serif`;
  /** Split a line into chunks of up to three words / ~14 letters. */
  const chunkCache = new Map();
  function chunksOf(line) {
    const key = line.index + "|" + line.text;
    let c = chunkCache.get(key);
    if (c) return c;
    c = [];
    let cur = [];
    let chars = 0;
    line.words.forEach((w) => {
      if (cur.length && (cur.length >= 3 || chars + w.text.length > 14)) {
        c.push(cur);
        cur = [];
        chars = 0;
      }
      cur.push(w);
      chars += w.text.length + 1;
    });
    if (cur.length) c.push(cur);
    if (chunkCache.size > 400) chunkCache.clear();
    chunkCache.set(key, c);
    return c;
  }
  const wordPop = {
    id: "wordpop",
    label: "Word Pop",
    tag: "Redes",
    fonts: ["900 100px Poppins"],
    draw(g, f) {
      const { W, H, t, safe } = f;
      const u = safe.w / 825;
      const pulse = f.pulse();
      const L = f.lines[f.current];
      const accent = POP_ACCENTS[Math.max(0, f.current) % POP_ACCENTS.length];
      g.fillStyle = "#0b0b0f";
      g.fillRect(0, 0, W, H);
      const bx = W * (0.5 + 0.22 * Math.sin(t * 0.23));
      const by = H * (0.5 + 0.1 * Math.cos(t * 0.19));
      const blob = g.createRadialGradient(bx, by, 0, bx, by, H * 0.58);
      blob.addColorStop(0, hexA(accent, 0.3 + 0.15 * pulse));
      blob.addColorStop(0.6, hexA(accent, 0.07));
      blob.addColorStop(1, hexA(accent, 0));
      g.fillStyle = blob;
      g.fillRect(0, 0, W, H);
      // speaker rings travelling out from the centre
      g.save();
      g.strokeStyle = "#ffffff";
      g.lineWidth = u * 3;
      for (let i = 0; i < 5; i++) {
        const ph = (t * 0.32 + i / 5) % 1;
        g.globalAlpha = (1 - ph) * (0.05 + 0.1 * pulse);
        g.beginPath();
        g.arc(W / 2, safe.y + safe.h / 2, ph * H * 0.75, 0, Math.PI * 2);
        g.stroke();
      }
      g.restore();
      // diagonal stripes, very subtle texture
      g.save();
      g.globalAlpha = 0.035;
      g.fillStyle = "#ffffff";
      g.translate(W / 2, H / 2);
      g.rotate(-0.5);
      const sp = u * 60;
      const off = (t * u * 20) % sp;
      for (let x = -H; x < H; x += sp) g.fillRect(x + off, -H, u * 18, H * 2);
      g.restore();
      if (L && L.words.length) this.drawChunk(g, f, L, u, accent, pulse);
    },
    drawChunk(g, f, L, u, accent, pulse) {
      const { t, safe } = f;
      const ws = L.words;
      const j = Math.max(0, activeWord(L, t));
      const last = ws[ws.length - 1];
      const out = clamp(1 - (t - last.t1 - 0.9) / 0.2);
      if (out <= 0) return;
      const chunks = chunksOf(L);
      const ci = chunks.findIndex((c) => c.includes(ws[j]));
      const chunk = chunks[ci];
      const words = chunk.map((w) => ({ ...w, label: upper(w.text) }));
      let size = u * 128;
      g.font = POP_FONT(100);
      const widest = Math.max(...words.map((w) => g.measureText(w.label).width));
      size = Math.min(size, (100 * safe.w * 0.86) / widest);
      const rows = wrapCached(g, `p|${L.index}|${ci}|${L.text}|${Math.round(size * 10)}`, words, () => POP_FONT(size), safe.w * 0.9, size * 0.28);
      const lh = size * 1.3;
      const cx = safe.x + safe.w / 2;
      const cy = safe.y + safe.h * 0.5;
      const enter = clamp((t - chunk[0].t0) / 0.3);
      const k = lerp(0.6, 1, ease.back(enter)) * (1 + 0.035 * pulse);
      g.save();
      g.translate(cx, cy);
      g.scale(k, k);
      g.rotate((rand(L.index * 7 + ci) - 0.5) * 0.06 * (1 - ease.out(enter)));
      g.globalAlpha = clamp(enter * 3) * out;
      g.textBaseline = "middle";
      g.textAlign = "left";
      g.font = POP_FONT(size);
      const rects = {};
      rows.forEach((row, ri) => {
        const ry = (ri - (rows.length - 1) / 2) * lh;
        row.items.forEach((it) => (rects[it.w.index] = { x: -row.width / 2 + it.x, y: ry, w: it.width }));
      });
      // the highlight box glides from the previous word to the active one
      const act = ws[j];
      const prevW = ws[j - 1];
      const A = rects[act.index];
      if (A && act.t0 <= t) {
        const B = prevW && rects[prevW.index] ? rects[prevW.index] : A;
        const m = ease.out(clamp((t - act.t0) / 0.13));
        const bx = lerp(B.x, A.x, m);
        const by = lerp(B.y, A.y, m);
        const bw = lerp(B.w, A.w, m);
        const pad = size * 0.16;
        const pop = lerp(1.18, 1, ease.back(clamp((t - act.t0) / 0.22)));
        g.save();
        g.translate(bx + bw / 2, by);
        g.rotate(-0.035);
        g.scale(pop, pop);
        g.shadowColor = hexA(accent, 0.6);
        g.shadowBlur = size * 0.4;
        g.fillStyle = accent;
        rrect(g, -bw / 2 - pad, -size * 0.6, bw + pad * 2, size * 1.14, size * 0.2);
        g.fill();
        g.restore();
      }
      chunk.forEach((w) => {
        const R = rects[w.index];
        if (!R || w.t0 > t) return;
        const p = clamp((t - w.t0) / 0.22);
        const sc = lerp(1.4, 1, ease.back(p));
        const isAct = w === act;
        g.save();
        g.translate(R.x + R.w / 2, R.y + size * 0.04);
        g.scale(sc, sc);
        g.translate(-R.w / 2, 0);
        const label = upper(w.text);
        if (!isAct) {
          g.lineJoin = "round";
          g.lineWidth = size * 0.16;
          g.strokeStyle = "#000000";
          g.shadowColor = "rgba(0,0,0,0.5)";
          g.shadowBlur = size * 0.15;
          g.shadowOffsetY = size * 0.05;
          g.strokeText(label, 0, 0);
          g.shadowColor = "transparent";
        }
        g.fillStyle = isAct ? "#0b0b0f" : "#ffffff";
        g.fillText(label, 0, 0);
        g.restore();
      });
      g.restore();
    },
  };

  // ======================================================================
  // 7. NOTAS — the lyric being typed into the phone's notes app
  // ======================================================================
  const NOTE = { bg: "#000000", ink: "#f2f2f7", mute: "#8d8d93", accent: "#ffd60a" };
  const NOTE_FONT = (w, size) => `${w} ${size}px Inter, -apple-system, 'Segoe UI', sans-serif`;
  const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const notes = {
    id: "notes",
    label: "Notas",
    tag: "Viral",
    fonts: ["400 100px Inter", "600 100px Inter", "700 100px Inter"],
    draw(g, f) {
      const { W, H, t, safe } = f;
      const u = safe.w / 825;
      g.fillStyle = NOTE.bg;
      g.fillRect(0, 0, W, H);
      const x0 = safe.x;
      const x1 = safe.x + safe.w;
      const navY = safe.y + u * 24;
      const barY = safe.y + safe.h - u * 30;
      const top = navY + u * 70;
      const bottom = barY - u * 70;
      // a bit larger than the real app, so the lyric reads on a phone feed
      const body = u * 50;
      const lh = u * 68;
      const para = u * 14;
      const head = { date: u * 50, title: u * 120 };
      // content heights up to each line, for the scroll
      const lines = f.lines;
      const blocks = [];
      let yy = head.date + head.title;
      for (let i = 0; i <= Math.min(f.current, lines.length - 1); i++) {
        const rows = this.rows(g, lines[i], body, safe.w);
        blocks.push({ y: yy, rows });
        yy += rows.length * lh + para;
      }
      const room = bottom - top;
      const scrollAt = (i) => (i < 0 ? 0 : Math.max(0, blocks[i].y + blocks[i].rows.length * lh + u * 40 - room));
      const L = lines[f.current];
      const k = L ? ease.inOut(clamp((t - L.start) / 0.35)) : 1;
      const scroll = f.current < 0 ? 0 : lerp(scrollAt(f.current - 1), scrollAt(f.current), k);

      g.save();
      g.beginPath();
      g.rect(0, top - u * 10, W, bottom - top + u * 10);
      g.clip();
      const oy = top - scroll;
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
      g.textBaseline = "alphabetic";
      g.textAlign = "center";
      g.fillStyle = NOTE.mute;
      g.font = NOTE_FONT(500, u * 26);
      g.fillText(`${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}, ${hh}`, safe.x + safe.w / 2, oy + u * 26);
      g.textAlign = "left";
      g.fillStyle = NOTE.ink;
      g.font = NOTE_FONT(700, u * 60);
      const title = (f.meta && f.meta.title) || "Letra";
      g.fillText(title, x0, oy + head.date + u * 66, safe.w);
      g.font = NOTE_FONT(400, body);
      let cursor = null;
      blocks.forEach((b, i) => {
        const line = lines[i];
        const typing = i === f.current;
        b.rows.forEach((row, ri) => {
          const y = oy + b.y + ri * lh + body;
          if (y < top - lh || y > bottom + lh) return;
          let x = x0;
          row.items.forEach((it) => {
            const w = it.w;
            let txt = w.label;
            if (typing) {
              const n = Math.ceil(sung(w, t) * txt.length);
              if (w.t0 > t) return;
              txt = txt.slice(0, n);
            }
            x = x0 + it.x;
            g.fillStyle = NOTE.ink;
            g.fillText(txt, x, y);
            if (typing) cursor = { x: x + g.measureText(txt).width, y };
          });
        });
        if (typing && !cursor) cursor = { x: x0, y: oy + b.y + body };
        // keep the caret in place once the line is done
        if (typing) this.caret(g, f, line, cursor, u, body);
      });
      if (f.current < 0) this.caret(g, f, null, { x: x0, y: oy + head.date + head.title + body }, u, body);
      g.restore();

      // fixed navigation bar and toolbar
      this.nav(g, f, u, x0, x1, navY);
      this.toolbar(g, u, x0, x1, barY);
      // soft fades where text scrolls under the bars
      const fadeT = g.createLinearGradient(0, top - u * 10, 0, top + u * 40);
      fadeT.addColorStop(0, NOTE.bg);
      fadeT.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = fadeT;
      g.fillRect(0, top - u * 10, W, u * 50);
    },
    rows(g, line, body, w) {
      const words = line.words.map((x) => ({ ...x, label: x.text }));
      return wrapCached(g, `n|${line.index}|${line.text}|${Math.round(body * 10)}|${Math.round(w)}`, words, () => NOTE_FONT(400, body), w, body * 0.28);
    },
    caret(g, f, line, c, u, body) {
      const { t } = f;
      let typing = false;
      if (line && line.words.length) typing = t < line.words[line.words.length - 1].t1 + 0.15;
      if (!typing && Math.floor(t * 1.9) % 2) return;
      g.fillStyle = NOTE.accent;
      rrect(g, c.x + u * 3, c.y - body * 0.86, u * 4.5, body * 1.12, u * 2);
      g.fill();
    },
    nav(g, f, u, x0, x1, y) {
      g.save();
      g.strokeStyle = g.fillStyle = NOTE.accent;
      g.lineCap = g.lineJoin = "round";
      g.lineWidth = u * 6;
      g.beginPath();
      g.moveTo(x0 + u * 18, y - u * 22);
      g.lineTo(x0, y);
      g.lineTo(x0 + u * 18, y + u * 22);
      g.stroke();
      g.font = NOTE_FONT(400, u * 40);
      g.textBaseline = "middle";
      g.textAlign = "left";
      g.fillText("Notas", x0 + u * 34, y + u * 1);
      g.textAlign = "right";
      g.font = NOTE_FONT(600, u * 40);
      g.fillText("Listo", x1, y + u * 1);
      const listoW = g.measureText("Listo").width;
      // ellipsis in a circle, then the share icon
      let cx = x1 - listoW - u * 58;
      g.lineWidth = u * 4;
      g.beginPath();
      g.arc(cx, y, u * 22, 0, Math.PI * 2);
      g.stroke();
      for (let i = -1; i <= 1; i++) {
        g.beginPath();
        g.arc(cx + i * u * 10, y, u * 3.2, 0, Math.PI * 2);
        g.fill();
      }
      cx -= u * 80;
      g.beginPath();
      g.moveTo(cx - u * 10, y - u * 6);
      g.lineTo(cx - u * 18, y - u * 6);
      g.lineTo(cx - u * 18, y + u * 24);
      g.lineTo(cx + u * 18, y + u * 24);
      g.lineTo(cx + u * 18, y - u * 6);
      g.lineTo(cx + u * 10, y - u * 6);
      g.moveTo(cx, y + u * 8);
      g.lineTo(cx, y - u * 28);
      g.moveTo(cx - u * 10, y - u * 18);
      g.lineTo(cx, y - u * 28);
      g.lineTo(cx + u * 10, y - u * 18);
      g.stroke();
      g.restore();
    },
    toolbar(g, u, x0, x1, y) {
      g.save();
      g.strokeStyle = g.fillStyle = NOTE.accent;
      g.lineCap = g.lineJoin = "round";
      g.lineWidth = u * 4;
      const n = 5;
      const xs = Array.from({ length: n }, (_, i) => x0 + u * 24 + ((x1 - x0 - u * 48) * i) / (n - 1));
      // checklist
      let x = xs[0];
      g.beginPath();
      g.arc(x - u * 8, y, u * 14, 0, Math.PI * 2);
      g.moveTo(x - u * 14, y);
      g.lineTo(x - u * 9, y + u * 5);
      g.lineTo(x - u * 2, y - u * 5);
      g.moveTo(x + u * 14, y - u * 6);
      g.lineTo(x + u * 30, y - u * 6);
      g.moveTo(x + u * 14, y + u * 6);
      g.lineTo(x + u * 26, y + u * 6);
      g.stroke();
      // Aa
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = NOTE_FONT(600, u * 34);
      g.fillText("Aa", xs[1], y + u * 1);
      // camera
      x = xs[2];
      rrect(g, x - u * 22, y - u * 14, u * 44, u * 30, u * 7);
      g.stroke();
      g.beginPath();
      g.arc(x, y + u * 1, u * 8, 0, Math.PI * 2);
      g.moveTo(x - u * 8, y - u * 14);
      g.lineTo(x - u * 4, y - u * 20);
      g.lineTo(x + u * 4, y - u * 20);
      g.lineTo(x + u * 8, y - u * 14);
      g.stroke();
      // pen tip
      x = xs[3];
      g.beginPath();
      g.moveTo(x - u * 8, y + u * 20);
      g.lineTo(x - u * 8, y - u * 6);
      g.lineTo(x, y - u * 22);
      g.lineTo(x + u * 8, y - u * 6);
      g.lineTo(x + u * 8, y + u * 20);
      g.moveTo(x - u * 8, y - u * 6);
      g.lineTo(x + u * 8, y - u * 6);
      g.stroke();
      // compose
      x = xs[4];
      g.beginPath();
      g.moveTo(x + u * 2, y - u * 18);
      g.lineTo(x - u * 18, y - u * 18);
      g.lineTo(x - u * 18, y + u * 18);
      g.lineTo(x + u * 18, y + u * 18);
      g.lineTo(x + u * 18, y - u * 2);
      g.moveTo(x - u * 4, y + u * 4);
      g.lineTo(x + u * 20, y - u * 20);
      g.stroke();
      g.restore();
    },
  };

  // ======================================================================
  // 8. AURORA — flowing light behind a frosted-glass lyric card
  // ======================================================================
  const AURORA_COLS = ["#00e0c6", "#7b5cff", "#ff4fd8", "#2f8bff", "#00ff9d"];
  const AUR_FONT = (w, size) => `${w} ${size}px Inter, -apple-system, 'Segoe UI', sans-serif`;
  let auroraSmall = null;
  const aurora = {
    id: "aurora",
    label: "Aurora",
    tag: "Glass",
    fonts: ["500 100px Inter", "700 100px Inter", "800 100px Inter"],
    drawBg(g, W, H, t, en, pulse) {
      g.fillStyle = "#04050d";
      g.fillRect(0, 0, W, H);
      g.save();
      g.globalCompositeOperation = "lighter";
      AURORA_COLS.forEach((c, i) => {
        const x = W * (0.5 + 0.42 * Math.sin(t * (0.09 + i * 0.017) + i * 1.7));
        const y = H * (0.5 + 0.36 * Math.cos(t * (0.07 + i * 0.013) + i * 2.3));
        const r = H * (0.36 + 0.08 * Math.sin(t * 0.2 + i));
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        const a = (0.42 + 0.22 * en) * (1 + 0.25 * pulse);
        gr.addColorStop(0, hexA(c, Math.min(0.9, a)));
        gr.addColorStop(0.55, hexA(c, a * 0.3));
        gr.addColorStop(1, hexA(c, 0));
        g.fillStyle = gr;
        g.fillRect(0, 0, W, H);
      });
      g.restore();
    },
    draw(g, f) {
      const { W, H, t, safe } = f;
      const u = safe.w / 825;
      const en = f.energy();
      const pulse = f.pulse();
      this.drawBg(g, W, H, t, en, pulse);
      // fine stars over the light
      for (let i = 0; i < 40; i++) {
        const tw = 0.5 + 0.5 * Math.sin(t * (0.6 + rand(i) * 1.5) + i * 3);
        g.fillStyle = `rgba(255,255,255,${0.35 * tw})`;
        const s = u * (1.5 + rand(i * 5) * 2.5);
        g.fillRect(rand(i * 1.7) * W, rand(i * 8.3) * H, s, s);
      }
      // the same scene, tiny, to fake the glass blur when scaled back up
      const sw = Math.max(8, Math.round(W / 14));
      const sh = Math.max(8, Math.round(H / 14));
      if (!auroraSmall) auroraSmall = document.createElement("canvas");
      if (auroraSmall.width !== sw || auroraSmall.height !== sh) {
        auroraSmall.width = sw;
        auroraSmall.height = sh;
      }
      this.drawBg(auroraSmall.getContext("2d"), sw, sh, t, en, pulse);
      this.drawCard(g, f, u, pulse);
    },
    layout(g, line, size, w) {
      const words = line.words.map((x) => ({ ...x, label: x.text }));
      return wrapCached(g, `a|${line.index}|${line.text}|${Math.round(size * 10)}|${Math.round(w)}`, words, () => AUR_FONT(800, size), w, size * 0.28);
    },
    drawCard(g, f, u, pulse) {
      const { W, H, t, safe } = f;
      const L = f.lines[f.current];
      const prev = f.lines[f.current - 1];
      const cw = safe.w * 0.94;
      const pad = u * 48;
      const inner = cw - pad * 2;
      const size = u * 64;
      const lh = size * 1.18;
      const headH = u * 78;
      const footH = u * 96;
      const hOf = (line) => (line && line.words.length ? Math.max(1, this.layout(g, line, size, inner).length) : 1) * lh;
      const k = L ? ease.inOut(clamp((t - L.start) / 0.45)) : 1;
      const textH = lerp(hOf(prev || L), hOf(L), k);
      const ch = pad + headH + u * 30 + textH + u * 30 + footH;
      const cx = safe.x + (safe.w - cw) / 2;
      const cy = safe.y + (safe.h - ch) / 2 + Math.sin(t * 0.8) * u * 6;
      const r = u * 52;
      g.save();
      // shadow under the glass
      g.shadowColor = "rgba(0,0,0,0.45)";
      g.shadowBlur = u * 70;
      g.shadowOffsetY = u * 30;
      g.fillStyle = "rgba(10,10,25,0.5)";
      rrect(g, cx, cy, cw, ch, r);
      g.fill();
      g.restore();
      g.save();
      rrect(g, cx, cy, cw, ch, r);
      g.clip();
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = "high";
      g.drawImage(auroraSmall, 0, 0, W, H);
      g.fillStyle = "rgba(255,255,255,0.10)";
      g.fillRect(cx, cy, cw, ch);
      const sheen = g.createLinearGradient(cx, cy, cx + cw * 0.6, cy + ch);
      sheen.addColorStop(0, "rgba(255,255,255,0.22)");
      sheen.addColorStop(0.45, "rgba(255,255,255,0.03)");
      sheen.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = sheen;
      g.fillRect(cx, cy, cw, ch);

      // header: cover, title, artist, equaliser
      const hx = cx + pad;
      const hy = cy + pad;
      const art = g.createLinearGradient(hx, hy, hx + headH, hy + headH);
      art.addColorStop(0, "#00e0c6");
      art.addColorStop(0.5, "#7b5cff");
      art.addColorStop(1, "#ff4fd8");
      g.fillStyle = art;
      rrect(g, hx, hy, headH, headH, u * 16);
      g.fill();
      g.fillStyle = "#ffffff";
      g.beginPath();
      g.arc(hx + headH * 0.4, hy + headH * 0.66, headH * 0.11, 0, Math.PI * 2);
      g.fill();
      g.fillRect(hx + headH * 0.48, hy + headH * 0.26, headH * 0.06, headH * 0.42);
      g.fillRect(hx + headH * 0.48, hy + headH * 0.26, headH * 0.22, headH * 0.06);
      const meta = f.meta || {};
      g.textAlign = "left";
      g.textBaseline = "middle";
      g.fillStyle = "#ffffff";
      g.font = AUR_FONT(700, u * 30);
      g.fillText(meta.title || "Wave Music", hx + headH + u * 22, hy + headH * 0.32, inner - headH - u * 120);
      g.globalAlpha = 0.65;
      g.font = AUR_FONT(500, u * 26);
      g.fillText(meta.artist || "Lyrics", hx + headH + u * 22, hy + headH * 0.72, inner - headH - u * 120);
      g.globalAlpha = 1;
      for (let i = 0; i < 4; i++) {
        const v = 0.25 + 0.75 * Math.abs(Math.sin(t * (3.1 + i * 1.3) + i)) * (0.5 + 0.5 * f.energy());
        const bh = headH * 0.5 * v;
        rrect(g, cx + cw - pad - u * 64 + i * u * 17, hy + headH / 2 + headH * 0.25 - bh, u * 9, bh, u * 4);
        g.fill();
      }

      // lyric: sung words bright, the rest waiting in soft white
      const ty = hy + headH + u * 30;
      g.save();
      g.beginPath();
      g.rect(cx, ty - u * 10, cw, textH + u * 20);
      g.clip();
      const show = (line, alphaMul, dy) => {
        if (!line || !line.words.length || alphaMul <= 0) return;
        const rows = this.layout(g, line, size, inner);
        g.font = AUR_FONT(800, size);
        g.textBaseline = "middle";
        rows.forEach((row, ri) => {
          row.items.forEach((it) => {
            const p = sung(it.w, t);
            const y = ty + ri * lh + lh / 2 + dy;
            g.globalAlpha = alphaMul * lerp(0.32, 1, ease.out(p));
            if (p > 0 && p < 1) {
              g.shadowColor = "rgba(255,255,255,0.8)";
              g.shadowBlur = size * 0.4 * Math.sin(Math.PI * p);
            } else g.shadowBlur = 0;
            g.fillStyle = "#ffffff";
            g.fillText(it.w.label, hx + it.x, y - u * 4 * Math.sin(Math.PI * p));
          });
        });
        g.shadowBlur = 0;
        g.globalAlpha = 1;
      };
      if (prev && k < 1) show(prev, 1 - k, -lh * 0.8 * k);
      show(L, L && prev ? k : 1, lh * 0.8 * (1 - k));
      g.restore();

      // footer: next line + line progress
      const fy = ty + textH + u * 30;
      const next = f.lines[f.current + 1];
      if (next) {
        g.globalAlpha = 0.5 * (L ? k : 1);
        g.font = AUR_FONT(500, u * 28);
        g.textBaseline = "middle";
        let txt = next.text;
        while (txt.length > 1 && g.measureText(txt + "…").width > inner) txt = txt.slice(0, -1);
        g.fillText(txt === next.text ? txt : txt.trimEnd() + "…", hx, fy + u * 20);
        g.globalAlpha = 1;
      }
      const prog = L ? clamp((t - L.start) / Math.max(0.5, L.end - L.start)) : 0;
      g.fillStyle = "rgba(255,255,255,0.22)";
      rrect(g, hx, fy + u * 64, inner, u * 7, u * 4);
      g.fill();
      g.fillStyle = "#ffffff";
      rrect(g, hx, fy + u * 64, Math.max(u * 7, inner * prog), u * 7, u * 4);
      g.fill();
      g.restore();
      // glass edge, brighter on top
      const edge = g.createLinearGradient(0, cy, 0, cy + ch);
      edge.addColorStop(0, `rgba(255,255,255,${0.55 + 0.2 * pulse})`);
      edge.addColorStop(1, "rgba(255,255,255,0.12)");
      g.strokeStyle = edge;
      g.lineWidth = Math.max(1, u * 2);
      rrect(g, cx, cy, cw, ch, r);
      g.stroke();
    },
  };

  const fmt = (t) => Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0");

  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  const PRESETS = { kinetic, cinematic, neon, minimal, karaoke, wordpop: wordPop, notes, aurora };
  WM.Presets = {
    list: Object.values(PRESETS),
    get: (id) => PRESETS[id],
    /** Wait for every preset font (canvas text needs them loaded). */
    loadFonts() {
      if (!document.fonts) return Promise.resolve();
      const all = Object.values(PRESETS).flatMap((p) => p.fonts);
      return Promise.all(all.map((f) => document.fonts.load(f).catch(() => null)));
    },
  };
})((window.WaveMusic = window.WaveMusic || {}));
