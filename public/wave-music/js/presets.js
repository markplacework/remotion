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
      // the line's key word scrolls huge and outlined behind everything
      const big = L.words.length ? upper(L.words[longestIndex(L.words)].text) : "";
      if (big) {
        g.save();
        g.font = `400 ${u * 380}px Anton, Impact, sans-serif`;
        g.textBaseline = "middle";
        g.textAlign = "left";
        g.lineWidth = Math.max(1, u * 2.5);
        g.strokeStyle = hexA(accent, 0.18);
        const tw = g.measureText(big + "  ").width;
        if (tw > u * 20) {
          for (let r = 0; r < 3; r++) {
            const dir = r % 2 ? 1 : -1;
            const off = (((t - L.start) * u * 140 + r * tw * 0.37) % tw + tw) % tw;
            for (let x = dir > 0 ? off - tw : -off; x < W; x += tw) g.strokeText(big, x, H * (0.18 + 0.32 * r));
          }
        }
        g.restore();
      }
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
        if (r.isHero) {
          // echo outlines trailing behind the key row
          g.shadowBlur = 0;
          g.lineWidth = Math.max(1, u * 2.5);
          for (let e = 2; e >= 1; e--) {
            g.strokeStyle = hexA(o.accent, 0.4 / e);
            g.strokeText(r.label, e * u * 9, e * u * 9);
          }
          g.shadowBlur = u * 24;
          g.fillStyle = o.accent;
          g.fillText(r.label, 0, 0);
        } else if (i % 2 === 1 && spec.length > 2) {
          // alternate rows go hollow: contrast without another colour
          g.shadowBlur = 0;
          g.lineWidth = Math.max(1, u * 3.5);
          g.strokeStyle = "#ffffff";
          g.strokeText(r.label, 0, 0);
        } else {
          g.fillStyle = "#ffffff";
          g.fillText(r.label, 0, 0);
        }
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
  const CINE_SERIF = "'Cormorant Garamond', Georgia, serif";
  /** Text drawn only as its blurred shadow: a lens out of focus. */
  function blurText(g, txt, x, y, blur, color) {
    // shadow offset and blur live in device pixels, the text in user space
    const k = g.getTransform().a || 1;
    const off = 20000;
    g.save();
    g.shadowColor = color;
    g.shadowBlur = blur * k;
    g.shadowOffsetX = off;
    g.fillStyle = "#000";
    g.fillText(txt, x - off / k, y);
    g.restore();
  }
  const cinematic = {
    id: "cinematic",
    label: "Cinematic",
    tag: "Película",
    fonts: ["500 100px 'Cormorant Garamond'", "italic 500 100px 'Cormorant Garamond'", "600 100px 'Cormorant Garamond'", "500 100px Inter"],
    draw(g, f) {
      const { W, H, t, safe } = f;
      const u = safe.w / 825;
      const pulse = f.pulse();
      g.save();
      // gate weave: the whole picture breathes a hair, like film in a projector
      g.translate(Math.sin(t * 1.7) * u * 1.2, Math.cos(t * 1.3) * u * 1.6);
      // teal & orange grade: cool night above, warm haze below
      const sky = g.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#03090d");
      sky.addColorStop(0.45, "#0a1d24");
      sky.addColorStop(0.78, "#2a1a10");
      sky.addColorStop(1, "#120804");
      g.fillStyle = sky;
      g.fillRect(-u * 10, -u * 10, W + u * 20, H + u * 20);
      // low sun haze, drifting slowly
      const sx = W * (0.62 + 0.08 * Math.sin(t * 0.04));
      const sy = H * 0.7;
      const sun = g.createRadialGradient(sx, sy, 0, sx, sy, H * 0.55);
      sun.addColorStop(0, "rgba(255,170,90,0.42)");
      sun.addColorStop(0.35, "rgba(255,120,60,0.14)");
      sun.addColorStop(1, "rgba(255,120,60,0)");
      g.fillStyle = sun;
      g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = "lighter";
      // volumetric light shafts from the top corner
      for (let i = 0; i < 4; i++) {
        const a = -0.45 + i * 0.17 + Math.sin(t * 0.08 + i) * 0.03;
        const len = H * 1.3;
        const w = W * (0.09 + rand(i * 4.1) * 0.1);
        g.save();
        g.translate(W * 0.92, -H * 0.04);
        g.rotate(a + 0.5);
        const gr = g.createLinearGradient(0, 0, 0, len);
        const al = (0.05 + 0.05 * rand(i * 2.7)) * (0.8 + 0.2 * Math.sin(t * 0.5 + i * 2));
        gr.addColorStop(0, `rgba(255,214,170,${al})`);
        gr.addColorStop(1, "rgba(255,214,170,0)");
        g.fillStyle = gr;
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(-w, len);
        g.lineTo(w, len);
        g.closePath();
        g.fill();
        g.restore();
      }
      // a few big soft bokeh far behind
      for (let i = 0; i < 9; i++) {
        const warm = rand(i * 3.1) > 0.4;
        const r = u * (70 + rand(i * 2.3) * 120);
        const x = rand(i * 7.7) * W + Math.sin(t * 0.05 + i) * u * 50;
        const y = H * (0.15 + rand(i * 9.1) * 0.8) + Math.cos(t * 0.04 + i) * u * 30;
        const col = warm ? "255,170,100" : "90,200,230";
        const grd = g.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, `rgba(${col},0.09)`);
        grd.addColorStop(0.6, `rgba(${col},0.06)`);
        grd.addColorStop(1, `rgba(${col},0)`);
        g.fillStyle = grd;
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
      }
      // dust floating in the light
      for (let i = 0; i < 70; i++) {
        const depth = 0.3 + rand(i * 5.3) * 0.7;
        const x = (rand(i * 1.9) * W + t * u * 14 * depth + Math.sin(t * 0.3 + i) * u * 20) % W;
        const y = (rand(i * 8.3) * H - t * u * 9 * depth + H * 10) % H;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (0.5 + depth) + i));
        const r = u * (1.2 + 2.6 * depth);
        g.fillStyle = `rgba(255,226,190,${0.5 * tw * depth})`;
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
      }
      g.globalCompositeOperation = "source-over";

      this.drawTitle(g, f, u);
      const ly = this.drawLyric(g, f, u);
      // anamorphic flare through the lyric, flaring on the beat
      if (ly != null) {
        g.globalCompositeOperation = "lighter";
        const fl = 0.25 + 0.55 * pulse;
        const streak = g.createLinearGradient(0, 0, W, 0);
        streak.addColorStop(0, "rgba(80,190,255,0)");
        streak.addColorStop(0.5, `rgba(120,210,255,${0.22 * fl})`);
        streak.addColorStop(1, "rgba(80,190,255,0)");
        g.fillStyle = streak;
        g.fillRect(0, ly - u * 2, W, u * 4);
        g.fillStyle = `rgba(80,190,255,${0.05 * fl})`;
        g.fillRect(0, ly - u * 14, W, u * 28);
        g.globalCompositeOperation = "source-over";
      }
      g.restore();

      // grade, vignette, grain and the scope bars
      const vig = g.createRadialGradient(W / 2, H * 0.5, H * 0.22, W / 2, H * 0.5, H * 0.78);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.78)");
      g.fillStyle = vig;
      g.fillRect(0, 0, W, H);
      g.save();
      g.globalAlpha = 0.085;
      const tile = grainTile();
      const ox = Math.floor(rand(Math.floor(t * 24)) * 192);
      const oy = Math.floor(rand(Math.floor(t * 24) + 3) * 192);
      g.translate(-ox, -oy);
      g.fillStyle = g.createPattern(tile, "repeat");
      g.fillRect(0, 0, W + 192, H + 192);
      g.restore();
      const bar = H * 0.075;
      g.fillStyle = "#000";
      g.fillRect(0, 0, W, bar);
      g.fillRect(0, H - bar, W, bar);
    },
    /** Opening title card, before the first line is sung. */
    drawTitle(g, f, u) {
      const { t, safe, lines } = f;
      const first = lines[0];
      const end = first ? first.start : 4;
      const a = clamp(t / 1.2) * clamp((end - 0.25 - t) / 0.7);
      if (a <= 0) return;
      const meta = f.meta || {};
      const title = meta.title || "Wave Music";
      const cx = safe.x + safe.w / 2;
      const cy = safe.y + safe.h * 0.5;
      const push = 1 + 0.04 * clamp(t / Math.max(1, end));
      g.save();
      g.translate(cx, cy);
      g.scale(push, push);
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.globalAlpha = a;
      if (meta.artist) {
        g.font = `500 ${u * 22}px Inter, sans-serif`;
        if ("letterSpacing" in g) g.letterSpacing = `${u * 9}px`;
        g.fillStyle = "rgba(246,239,228,0.75)";
        g.fillText(upper(meta.artist), u * 4.5, -u * 92);
      }
      if ("letterSpacing" in g) g.letterSpacing = "0px";
      let size = u * 96;
      g.font = `italic 500 ${size}px ${CINE_SERIF}`;
      const tw = g.measureText(title).width;
      if (tw > safe.w * 0.9) size *= (safe.w * 0.9) / tw;
      g.font = `italic 500 ${size}px ${CINE_SERIF}`;
      g.shadowColor = "rgba(255,226,190,0.45)";
      g.shadowBlur = u * 26;
      g.fillStyle = "#f6efe4";
      g.fillText(title, 0, 0);
      g.shadowBlur = 0;
      g.fillStyle = "rgba(246,239,228,0.6)";
      const lw = u * 120 * ease.out(clamp(t / 1.6));
      g.fillRect(-lw / 2, u * 76, lw, Math.max(1, u * 1.5));
      g.restore();
      if ("letterSpacing" in g) g.letterSpacing = "0px";
    },
    /** Trailer-style lyric: tracked capitals, the key word in italic. Returns its centre y. */
    drawLyric(g, f, u) {
      const { t, safe } = f;
      const size = u * 70;
      const track = size * 0.2;
      const cy = safe.y + safe.h * 0.5;
      const has = "letterSpacing" in g;
      const fontOf = (w) => {
        if (has) g.letterSpacing = w.hero ? "0px" : `${track}px`;
        return w.hero ? `italic 500 ${size * 1.42}px ${CINE_SERIF}` : `600 ${size}px ${CINE_SERIF}`;
      };
      const show = (line, alphaMul, lift, out) => {
        if (!line || !line.words.length || alphaMul <= 0) return;
        const hero = longestIndex(line.words);
        const words = line.words.map((w) => ({ ...w, hero: w.index === hero, label: w.index === hero ? w.text.toLocaleLowerCase("es") : upper(w.text) }));
        const rows = wrapCached(g, `c2|${line.index}|${line.text}|${Math.round(size * 10)}|${Math.round(safe.w)}`, words, fontOf, safe.w * 0.88, size * 0.55);
        const lh = size * 1.7;
        // a slow push-in across the whole line, like a dolly move
        const dur = Math.max(1, line.end - line.start);
        const push = 1 + 0.045 * clamp((t - line.start) / dur);
        g.save();
        g.translate(safe.x + safe.w / 2, cy + lift);
        g.scale(push, push);
        g.textBaseline = "middle";
        g.textAlign = "left";
        rows.forEach((row, ri) => {
          const y = (ri - (rows.length - 1) / 2) * lh;
          row.items.forEach((it) => {
            const w = it.w;
            // focus pull: each word starts soft and racks into focus
            const a = out ? 1 : clamp((t - w.t0 + 0.12) / 0.75);
            if (a <= 0) return;
            g.font = fontOf(w);
            const x = -row.width / 2 + it.x;
            const sharp = ease.inOut(a);
            const blur = out ? u * 30 * (1 - alphaMul) : u * 34 * (1 - sharp);
            if (blur > u) blurText(g, w.label, x, y, blur, `rgba(255,232,205,${(out ? alphaMul : Math.min(1, a * 2)) * 0.9})`);
            g.globalAlpha = (out ? alphaMul * alphaMul : sharp * sharp) * 1;
            g.shadowColor = "rgba(255,220,180,0.35)";
            g.shadowBlur = u * 18;
            g.fillStyle = w.hero ? "#ffd9a8" : "#f6efe4";
            g.fillText(w.label, x, y);
            g.shadowBlur = 0;
            g.globalAlpha = 1;
          });
        });
        g.restore();
        if (has) g.letterSpacing = "0px";
      };
      const L = f.lines[f.current];
      const prev = f.lines[f.current - 1];
      if (L && prev) {
        const e = clamp((t - L.start) / 0.5);
        if (e < 1) show(prev, 1 - e, -u * 18 * ease.out(e), true);
      }
      if (L) show(L, 1, 0, false);
      return L ? cy : null;
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

      // wet floor: the sun mirrored on the grid (drawn before the lyric)
      const m = g.getTransform();
      const rh = Math.min(sunR * 1.05, H - hz);
      if (rh > 0 && m.b === 0 && m.c === 0) {
        g.save();
        g.translate(0, hz * 2);
        g.scale(1, -1);
        g.globalAlpha = 0.2;
        g.drawImage(g.canvas, m.e, m.f + (hz - rh) * m.d, W * m.a, rh * m.d, 0, hz - rh, W, rh);
        g.restore();
        const fade = g.createLinearGradient(0, hz, 0, hz + rh);
        fade.addColorStop(0, "rgba(6,0,15,0)");
        fade.addColorStop(1, "rgba(6,0,15,0.55)");
        g.fillStyle = fade;
        g.fillRect(0, hz, W, rh);
      }
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
  const MIN = { bg: "#f2efe8", ink: "#141311", mute: "#8e877b", accent: "#ff4a1c", rule: "rgba(20,19,17,0.14)" };
  const MIN_SANS = (w, size) => `${w} ${size}px Inter, 'Helvetica Neue', Arial, sans-serif`;
  const MIN_SERIF = (size) => `italic 400 ${size}px 'Instrument Serif', Georgia, serif`;
  const minimal = {
    id: "minimal",
    label: "Minimal",
    tag: "Editorial",
    fonts: ["400 100px 'Instrument Serif'", "italic 400 100px 'Instrument Serif'", "500 100px Inter", "700 100px Inter", "800 100px Inter"],
    draw(g, f) {
      const { W, H, t, safe, lines } = f;
      const u = safe.w / 825;
      const has = "letterSpacing" in g;
      g.fillStyle = MIN.bg;
      g.fillRect(0, 0, W, H);
      // paper: a whisper of grain
      g.save();
      g.globalAlpha = 0.045;
      g.fillStyle = g.createPattern(grainTile(), "repeat");
      g.fillRect(0, 0, W, H);
      g.restore();
      const x0 = safe.x + u * 6;
      const x1 = safe.x + safe.w - u * 6;
      const cur = Math.max(0, f.current);
      const L = lines[f.current];

      // Swiss grid: hairline columns
      g.fillStyle = MIN.rule;
      [x0, safe.x + safe.w / 2, x1].forEach((x) => g.fillRect(x, safe.y + u * 70, Math.max(1, u), safe.h - u * 140));

      // header: title / artist, then the running index with a progress rule
      const meta = f.meta || {};
      g.textBaseline = "alphabetic";
      g.textAlign = "left";
      g.fillStyle = MIN.ink;
      g.font = MIN_SANS(700, u * 24);
      g.fillText(meta.title || "Wave Music", x0, safe.y + u * 14, safe.w * 0.6);
      g.textAlign = "right";
      g.fillStyle = MIN.mute;
      g.font = MIN_SANS(500, u * 24);
      g.fillText(meta.artist || "Lyric edition", x1, safe.y + u * 14, safe.w * 0.38);
      const total = Math.max(1, lines.length);
      const idx = String(cur + 1).padStart(2, "0") + " / " + String(total).padStart(2, "0");
      g.textAlign = "left";
      g.fillStyle = MIN.ink;
      g.font = MIN_SANS(500, u * 22);
      if (has) g.letterSpacing = `${u * 2}px`;
      g.fillText(idx, x0, safe.y + u * 56);
      g.textAlign = "right";
      g.fillText(fmt(t), x1, safe.y + u * 56);
      if (has) g.letterSpacing = "0px";
      const ry = safe.y + u * 74;
      g.fillStyle = MIN.ink;
      g.fillRect(x0, ry, x1 - x0, Math.max(1, u * 1.4));
      const prog = (cur + (L ? clamp((t - L.start) / Math.max(0.5, L.end - L.start)) : 0)) / total;
      g.fillStyle = MIN.accent;
      g.fillRect(x0, ry - u * 2, (x1 - x0) * prog, u * 5);

      // a huge outlined numeral sitting in the lower grid
      g.save();
      g.font = MIN_SANS(800, u * 420);
      g.textAlign = "left";
      g.textBaseline = "alphabetic";
      if (has) g.letterSpacing = `${-u * 24}px`;
      g.strokeStyle = "rgba(20,19,17,0.13)";
      g.lineWidth = Math.max(1, u * 1.6);
      const n = String(cur + 1).padStart(2, "0");
      const k = L ? ease.out(clamp((t - L.start) / 0.8)) : 1;
      g.globalAlpha = k;
      g.strokeText(n, x0 - u * 16, safe.y + safe.h - u * 40 + u * 40 * (1 - k));
      if (has) g.letterSpacing = "0px";
      g.restore();

      // footer
      g.fillStyle = MIN.mute;
      g.font = MIN_SERIF(u * 30);
      g.textAlign = "right";
      g.textBaseline = "alphabetic";
      g.fillText("wave music", x1, safe.y + safe.h - u * 4);
      g.fillStyle = MIN.accent;
      g.beginPath();
      g.arc(x1 - g.measureText("wave music").width - u * 18, safe.y + safe.h - u * 14, u * 6, 0, Math.PI * 2);
      g.fill();

      const prev = lines[f.current - 1];
      if (L && prev) {
        const e = clamp((t - L.start) / 0.32);
        if (e < 1) this.drawLine(g, f, prev, u, x0, x1, e);
      }
      if (L) this.drawLine(g, f, L, u, x0, x1, null);
    },
    /** The lyric: tight bold sans, the key word in an accent italic serif. */
    drawLine(g, f, line, u, x0, x1, exit) {
      const { t, safe } = f;
      if (!line.words.length) return;
      const has = "letterSpacing" in g;
      const size = u * 100;
      const hero = longestIndex(line.words);
      const fontOf = (w) => {
        if (has) g.letterSpacing = w.hero ? "0px" : `${-size * 0.045}px`;
        return w.hero ? MIN_SERIF(size * 1.18) : MIN_SANS(700, size);
      };
      const words = line.words.map((w) => ({ ...w, hero: w.index === hero, label: w.text }));
      const maxW = x1 - x0;
      const rows = wrapCached(g, `m2|${line.index}|${line.text}|${Math.round(size * 10)}|${Math.round(maxW)}`, words, fontOf, maxW, size * 0.24);
      const lh = size * 1.02;
      const top = safe.y + safe.h * 0.42 - (rows.length * lh) / 2;
      g.textBaseline = "alphabetic";
      g.textAlign = "left";
      rows.forEach((row, ri) => {
        const base = top + ri * lh + size * 0.86;
        // each row is a mask: words slide up into it, and out of it
        g.save();
        g.beginPath();
        g.rect(x0 - u * 20, top + ri * lh - size * 0.12, maxW + u * 40, lh + size * 0.38);
        g.clip();
        row.items.forEach((it) => {
          const w = it.w;
          let dy;
          if (exit != null) dy = -lh * ease.inOut(exit);
          else {
            const a = clamp((t - w.t0 + 0.06) / 0.5);
            if (a <= 0) return;
            dy = lh * 1.4 * (1 - ease.out(a));
          }
          g.font = fontOf(w);
          g.fillStyle = w.hero ? MIN.accent : MIN.ink;
          g.fillText(w.label, x0 + it.x, base + dy);
        });
        g.restore();
      });
      if (has) g.letterSpacing = "0px";
      if (exit != null) return;
      // the line's own timing, as a short rule under the text
      const prog = clamp((t - line.start) / Math.max(0.5, line.end - line.start));
      g.fillStyle = MIN.ink;
      g.fillRect(x0, top + rows.length * lh + u * 34, u * 120 * ease.out(prog), Math.max(1, u * 3));
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
      const { safe } = f;
      let t = f.t;
      const ws = L.words;
      // a hair early: on screen, text that lands with the voice reads as late
      t += 0.06;
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
        if (!R) return;
        // the whole chunk is on screen; each word kicks as it is sung
        const p = w.t0 <= t ? clamp((t - w.t0) / 0.22) : 1;
        const sc = lerp(1.16, 1, ease.back(p));
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
      const navY = safe.y + u * (f.mockup ? 78 : 24);
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
