// Wave Music · CAPTIONS
// Film-style subtitles for any video:
//   1. the video's audio is pulled out in the browser (16 kHz mono WAV, so
//      a big video never has to be uploaded),
//   2. our Modal service transcribes it word by word (/transcribe),
//   3. the words are cut into subtitles the way film subtitles are cut
//      (≤ 2 lines of ≤ 42 characters, a new card on pauses and sentence
//      ends, 1–6 s on screen),
//   4. drawCue() renders a card in one of a few sober styles; the preview
//      and the burned-in export use the same function,
//   5. SRT / VTT for any editor or platform.
(function (WM) {
  const LINE = 42;
  const MAX_CHARS = LINE * 2;
  const MAX_DUR = 6;
  const MIN_DUR = 0.9;
  const GAP_SPLIT = 0.7;

  // ---------- audio out of the video ----------
  async function extractWav(file) {
    const buf = await file.arrayBuffer();
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    let decoded;
    try {
      decoded = await ctx.decodeAudioData(buf);
    } catch {
      throw new Error("No se pudo leer el audio de ese video. Probá con un MP4.");
    } finally {
      ctx.close && ctx.close();
    }
    const rate = 16000;
    const off = new OfflineAudioContext(1, Math.ceil(decoded.duration * rate), rate);
    const src = off.createBufferSource();
    src.buffer = decoded;
    src.connect(off.destination);
    src.start();
    const pcm = (await off.startRendering()).getChannelData(0);
    // 16-bit WAV
    const out = new DataView(new ArrayBuffer(44 + pcm.length * 2));
    const str = (o, s) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
    str(0, "RIFF");
    out.setUint32(4, 36 + pcm.length * 2, true);
    str(8, "WAVE");
    str(12, "fmt ");
    out.setUint32(16, 16, true);
    out.setUint16(20, 1, true);
    out.setUint16(22, 1, true);
    out.setUint32(24, rate, true);
    out.setUint32(28, rate * 2, true);
    out.setUint16(32, 2, true);
    out.setUint16(34, 16, true);
    str(36, "data");
    out.setUint32(40, pcm.length * 2, true);
    for (let i = 0; i < pcm.length; i++) out.setInt16(44 + i * 2, Math.max(-1, Math.min(1, pcm[i])) * 0x7fff, true);
    return { wav: new Blob([out], { type: "audio/wav" }), duration: decoded.duration };
  }

  // ---------- transcription ----------
  async function transcribe({ wav, url, token }) {
    const fd = new FormData();
    fd.append("audio", wav, "audio.wav");
    let res;
    try {
      res = await fetch(url.replace(/\/+$/, "") + "/transcribe", { method: "POST", headers: token ? { Authorization: "Bearer " + token } : {}, body: fd });
    } catch {
      throw Object.assign(new Error("No se pudo conectar con la IA. Si estás en la vista previa de Claude, abrí el archivo descargado en Chrome."), { code: "network" });
    }
    if (res.status === 401) throw Object.assign(new Error("El token del servicio no es válido."), { code: "auth" });
    if (res.status === 404) throw Object.assign(new Error("El servicio no tiene Captions todavía."), { code: "missing" });
    if (!res.ok) {
      let msg = "";
      try {
        msg = (await res.json()).detail;
      } catch {
        /* ignore */
      }
      throw new Error("No se pudo transcribir" + (msg ? ": " + msg : " (" + res.status + ")"));
    }
    return res.json();
  }

  // ---------- words → subtitle cards ----------
  /** Two balanced lines, broken at the space nearest the middle. */
  function breakLines(text) {
    if (text.length <= LINE) return text;
    const mid = text.length / 2;
    let best = -1;
    for (let i = 0; i < text.length; i++) if (text[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
    return best < 0 ? text : text.slice(0, best) + "\n" + text.slice(best + 1);
  }
  function buildCues(words, duration) {
    const cues = [];
    let cur = []; // the words of the card being filled
    const text = (ws) => ws.map((w) => w.t).join(" ");
    const flush = (ws) => {
      if (ws.length) cues.push({ start: ws[0].start, end: ws[ws.length - 1].end, text: breakLines(text(ws)) });
    };
    words.forEach((w) => {
      const t = w.text.trim();
      if (!t) return;
      const item = { t, start: w.start, end: w.end };
      if (cur.length) {
        const last = cur[cur.length - 1];
        const gap = w.start - last.end;
        const sentence = /[.?!…]$/.test(last.t) && text(cur).length > 6;
        // a word that closes the phrase may stretch the card a little,
        // instead of being left alone at the start of the next one
        const room = /[.?!…,;:]$/.test(t) ? MAX_CHARS + 10 : MAX_CHARS;
        const tooLong = text(cur).length + 1 + t.length > room || w.end - cur[0].start > MAX_DUR;
        if (gap > GAP_SPLIT || sentence) {
          flush(cur);
          cur = [];
        } else if (tooLong) {
          // rather than cutting mid-phrase, close the card at its last comma
          // (if it's past the first third) and carry the rest over
          let k = -1;
          for (let i = cur.length - 1; i >= Math.ceil(cur.length / 3); i--)
            if (/[,;:]$/.test(cur[i - 1] ? cur[i - 1].t : "")) {
              k = i;
              break;
            }
          if (k > 0) {
            flush(cur.slice(0, k));
            cur = cur.slice(k);
          } else {
            flush(cur);
            cur = [];
          }
        }
      }
      cur.push(item);
    });
    flush(cur);
    // hold each card a little after the last word, never into the next one
    cues.forEach((c, i) => {
      const next = cues[i + 1] ? cues[i + 1].start - 0.08 : duration || c.end + 1;
      c.end = Math.min(Math.max(c.end + 0.35, c.start + MIN_DUR), Math.max(next, c.start + 0.3));
    });
    return cues;
  }

  // ---------- styles ----------
  const FAMILY = "Inter, 'Helvetica Neue', Arial, sans-serif";
  const STYLES = [
    { id: "cine", label: "Cine", hint: "Blanco con sombra suave" },
    { id: "netflix", label: "Streaming", hint: "Blanco con contorno fino" },
    { id: "caja", label: "Caja", hint: "Sobre franja oscura, como en TV" },
    { id: "amarillo", label: "Amarillo", hint: "El clásico de los DVD" },
  ];
  /**
   * Draw one subtitle card on a frame of W×H.
   * opts: { style, scale (1 = default size), pos ("bottom" | "top") }
   */
  function drawCue(g, W, H, text, opts = {}) {
    if (!text) return;
    const style = opts.style || "cine";
    const short = Math.min(W, H);
    const size = Math.round(short * 0.052 * (opts.scale || 1));
    g.save();
    g.font = `600 ${size}px ${FAMILY}`;
    g.textAlign = "center";
    g.textBaseline = "alphabetic";
    // honour the card's own breaks, wrap anything still too wide
    const maxW = W * 0.86;
    const lines = [];
    text.split("\n").forEach((part) => {
      let line = "";
      part.split(" ").forEach((word) => {
        const next = line ? line + " " + word : word;
        if (line && g.measureText(next).width > maxW) {
          lines.push(line);
          line = word;
        } else line = next;
      });
      if (line) lines.push(line);
    });
    const lh = size * 1.22;
    const margin = H * (W > H ? 0.075 : 0.12);
    const baseY = opts.pos === "top" ? margin + size : H - margin - (lines.length - 1) * lh;
    lines.forEach((ln, i) => {
      const y = baseY + i * lh;
      const x = W / 2;
      if (style === "caja") {
        const w = g.measureText(ln).width + size * 0.7;
        g.fillStyle = "rgba(0,0,0,0.72)";
        g.fillRect(x - w / 2, y - size * 0.98, w, size * 1.26);
        g.fillStyle = "#ffffff";
        g.fillText(ln, x, y);
        return;
      }
      if (style === "netflix" || style === "amarillo") {
        g.lineJoin = "round";
        g.lineWidth = Math.max(2, size * 0.13);
        g.strokeStyle = "rgba(0,0,0,0.92)";
        g.shadowColor = "rgba(0,0,0,0.45)";
        g.shadowBlur = size * 0.18;
        g.strokeText(ln, x, y);
        g.shadowColor = "transparent";
        g.fillStyle = style === "amarillo" ? "#ffe14d" : "#ffffff";
        g.fillText(ln, x, y);
        return;
      }
      // cine: white, soft dark halo
      g.shadowColor = "rgba(0,0,0,0.85)";
      g.shadowBlur = size * 0.32;
      g.shadowOffsetY = size * 0.04;
      g.fillStyle = "#ffffff";
      g.fillText(ln, x, y);
      g.fillText(ln, x, y);
      g.shadowColor = "transparent";
    });
    g.restore();
  }
  const cueAt = (cues, t) => cues.find((c) => t >= c.start && t < c.end) || null;

  // ---------- subtitle files ----------
  function stamp(t, sep) {
    t = Math.max(0, t);
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    const ms = Math.round((t - Math.floor(t)) * 1000);
    const p = (n, k = 2) => String(n).padStart(k, "0");
    return `${p(h)}:${p(m)}:${p(s)}${sep}${p(Math.min(999, ms), 3)}`;
  }
  const toSRT = (cues) => cues.map((c, i) => `${i + 1}\n${stamp(c.start, ",")} --> ${stamp(c.end, ",")}\n${c.text}\n`).join("\n");
  const toVTT = (cues) => "WEBVTT\n\n" + cues.map((c) => `${stamp(c.start, ".")} --> ${stamp(c.end, ".")}\n${c.text}\n`).join("\n");

  // ---------- burned-in export ----------
  /**
   * Plays the video once, drawing every frame plus its subtitle on a
   * canvas, and records it with the video's own audio (real time).
   */
  async function burnIn({ file, cues, opts, onProgress, signal }) {
    const type = WM.Exporter.pickType();
    if (!type) throw new Error("Este navegador no puede grabar video. Probá con Chrome.");
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.src = url;
    v.playsInline = true;
    v.preload = "auto";
    await new Promise((res, rej) => {
      v.onloadedmetadata = res;
      v.onerror = () => rej(new Error("No se pudo leer el video"));
    });
    // keep the video's own size, at most 1920 on the long side
    const k = Math.min(1, 1920 / Math.max(v.videoWidth, v.videoHeight));
    const W = Math.round((v.videoWidth * k) / 2) * 2;
    const H = Math.round((v.videoHeight * k) / 2) * 2;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext("2d");
    const stream = canvas.captureStream(30);
    const actx = new (window.AudioContext || window.webkitAudioContext)();
    const dest = actx.createMediaStreamDestination();
    actx.createMediaElementSource(v).connect(dest);
    dest.stream.getAudioTracks().forEach((tr) => stream.addTrack(tr));
    const rec = new MediaRecorder(stream, { mimeType: type.mime, videoBitsPerSecond: 12_000_000, audioBitsPerSecond: 192_000 });
    const chunks = [];
    rec.ondataavailable = (e) => e.data && e.data.size && chunks.push(e.data);
    const stopped = new Promise((r) => (rec.onstop = r));
    let raf = 0;
    let aborted = false;
    const draw = () => {
      g.drawImage(v, 0, 0, W, H);
      const c = cueAt(cues, v.currentTime);
      if (c) drawCue(g, W, H, c.text, opts);
    };
    try {
      v.currentTime = 0;
      await new Promise((r) => (v.onseeked = r));
      draw();
      rec.start(1000);
      await v.play();
      await new Promise((resolve) => {
        const tick = () => {
          if (signal && signal.aborted) {
            aborted = true;
            return resolve();
          }
          draw();
          if (onProgress) onProgress(v.currentTime, v.duration);
          if (v.ended) return resolve();
          raf = requestAnimationFrame(tick);
        };
        v.onended = () => resolve();
        tick();
      });
      draw();
      await new Promise((r) => setTimeout(r, 200));
      rec.stop();
      await stopped;
    } finally {
      cancelAnimationFrame(raf);
      v.pause();
      stream.getTracks().forEach((tr) => tr.stop());
      actx.close && actx.close();
      URL.revokeObjectURL(url);
    }
    if (aborted) throw Object.assign(new Error("Exportación cancelada"), { code: "cancelled" });
    return { blob: new Blob(chunks, { type: type.mime.split(";")[0] }), ext: type.ext };
  }

  WM.Captions = { extractWav, transcribe, buildCues, breakLines, drawCue, cueAt, toSRT, toVTT, burnIn, STYLES, stamp };
})((window.WaveMusic = window.WaveMusic || {}));
