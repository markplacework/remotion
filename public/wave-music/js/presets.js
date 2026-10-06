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
  const fmt = (t) => Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0");

  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  const PRESETS = { kinetic, cinematic, neon, minimal };
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
