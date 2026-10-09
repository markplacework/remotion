// Wave Music · EXPORTAR
// Records the "Video final" framing to a video file in the browser:
// VideoRenderer paints each frame on a canvas while the song plays on a
// separate (silent to the speakers) audio element, and MediaRecorder
// captures canvas + audio together. Real time: a 45 s song takes ~45 s.
// The audio clock drives the frames, exactly like the preview, so the
// exported sync is the one you see.
(function (WM) {
  const FPS = 30;

  // Prefer MP4 (plays everywhere, TikTok/Instagram ready); WebM otherwise.
  const TYPES = [
    { mime: "video/mp4;codecs=avc1.640028,mp4a.40.2", ext: "mp4" },
    { mime: "video/mp4;codecs=avc1.42E01F,mp4a.40.2", ext: "mp4" },
    { mime: "video/mp4", ext: "mp4" },
    { mime: "video/webm;codecs=vp9,opus", ext: "webm" },
    { mime: "video/webm;codecs=vp8,opus", ext: "webm" },
    { mime: "video/webm", ext: "webm" },
  ];

  function pickType() {
    if (typeof MediaRecorder === "undefined") return null;
    return TYPES.find((t) => MediaRecorder.isTypeSupported(t.mime)) || null;
  }

  function supported() {
    return !!pickType() && !!HTMLCanvasElement.prototype.captureStream;
  }

  /**
   * @param {{ timeline, audioSrc:string, backgroundSrc:string, duration:number,
   *           withAudio?:boolean, onProgress?(t, duration), onCanvas?(canvas),
   *           signal?:AbortSignal }} o
   * @returns {Promise<{ blob: Blob, ext: string }>}
   */
  async function exportVideo(o) {
    const type = pickType();
    if (!type) throw new Error("Este navegador no puede grabar video");

    // a realistic effect still downloading would be missing from the first frames
    if (WM.Fx) await WM.Fx.ready();
    const renderer = await WM.VideoRenderer.create(o.timeline, o.backgroundSrc, o.style);
    if (o.onCanvas) o.onCanvas(renderer.canvas);
    const sync = new WM.SyncEngine();
    sync.setTimeline(o.timeline);
    renderer.draw(0, sync.stateAt(0));

    const stream = renderer.canvas.captureStream(FPS);
    const el = new Audio();
    el.src = o.audioSrc;
    el.preload = "auto";
    let actx = null;
    if (o.withAudio !== false) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      actx = new Ctx();
      const dest = actx.createMediaStreamDestination();
      actx.createMediaElementSource(el).connect(dest);
      dest.stream.getAudioTracks().forEach((tr) => stream.addTrack(tr));
      await actx.resume();
    } else {
      el.muted = true;
    }
    await new Promise((res, rej) => {
      if (el.readyState >= 3) return res();
      el.oncanplaythrough = res;
      el.onerror = () => rej(new Error("No se pudo leer el audio"));
    });

    const rec = new MediaRecorder(stream, {
      mimeType: type.mime,
      videoBitsPerSecond: 10_000_000,
      audioBitsPerSecond: 192_000,
    });
    const chunks = [];
    rec.ondataavailable = (e) => e.data && e.data.size && chunks.push(e.data);
    const stopped = new Promise((res) => (rec.onstop = res));

    const end = Math.min(o.duration || el.duration, el.duration || Infinity);
    let raf = 0;
    let aborted = false;
    const cleanup = () => {
      cancelAnimationFrame(raf);
      el.pause();
      stream.getTracks().forEach((tr) => tr.stop());
      if (actx) actx.close();
      renderer.dispose();
    };

    try {
      rec.start(1000);
      el.currentTime = 0;
      await el.play();
      await new Promise((resolve) => {
        const tick = () => {
          if (o.signal && o.signal.aborted) {
            aborted = true;
            return resolve();
          }
          const t = el.currentTime;
          renderer.draw(t, sync.stateAt(t));
          if (o.onProgress) o.onProgress(t, end);
          if (el.ended || t >= end) return resolve();
          raf = requestAnimationFrame(tick);
        };
        el.onended = () => resolve();
        tick();
      });
      // one last frame so the final state is held, then close the file
      renderer.draw(end, sync.stateAt(end));
      await new Promise((r) => setTimeout(r, 250));
      rec.stop();
      await stopped;
    } finally {
      cleanup();
    }
    if (aborted) throw Object.assign(new Error("Exportación cancelada"), { code: "cancelled" });
    return { blob: new Blob(chunks, { type: type.mime.split(";")[0] }), ext: type.ext };
  }

  // ---------- saving ----------
  // Inside the claude.ai viewer, files are offered through the `downloads`
  // capability (the viewer confirms); opened as a plain page, a normal
  // browser download.
  const downloadsReady =
    window.claude && typeof window.claude.use === "function"
      ? window.claude.use("downloads").catch(() => null)
      : Promise.resolve(null);

  const SAVE_ERRORS = {
    declined: "Descarga cancelada",
    rate_limited: "Esperá un momento y probá de nuevo",
    too_large: "El video es demasiado grande para descargarlo acá",
  };

  async function saveFile(blob, filename) {
    const downloads = await downloadsReady;
    if (downloads) {
      try {
        await downloads.save({ filename, data: blob });
        return { ok: true };
      } catch (e) {
        return { ok: false, message: SAVE_ERRORS[e && e.code] || "No se pudo guardar el video" };
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return { ok: true };
  }

  WM.Exporter = { exportVideo, saveFile, supported, pickType };
})((window.WaveMusic = window.WaveMusic || {}));
