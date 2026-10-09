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
    return (typeof VideoEncoder !== "undefined" && !!window.Mp4Muxer) || (!!pickType() && !!HTMLCanvasElement.prototype.captureStream);
  }

  // ---------- MP4, frame by frame (WebCodecs) ----------
  // MediaRecorder writes fragmented files with an irregular frame rate and
  // often no duration, which some players, phones and apps refuse. Here
  // every frame is encoded at its exact 1/30 s slot and the song's audio
  // is encoded from the file itself, into a regular MP4 (H.264 + AAC, index
  // at the front): it plays everywhere. MediaRecorder stays as a fallback.
  // H.264 + AAC only: that is what plays everywhere (phones, WhatsApp, TikTok)
  const CODECS = {
    video: [
      // Main profile first: the one every phone, TV and desktop player decodes
      { codec: "avc1.4d0028", mux: "avc" },
      { codec: "avc1.640028", mux: "avc" },
      { codec: "avc1.42e028", mux: "avc" },
    ],
    audio: [{ codec: "mp4a.40.2", mux: "aac" }],
  };
  async function webCodecsSetup(withAudio) {
    if (typeof VideoEncoder === "undefined" || typeof VideoFrame === "undefined" || !window.Mp4Muxer) return null;
    let video = null;
    for (const c of CODECS.video) {
      const cfg = { codec: c.codec, width: 1080, height: 1920, bitrate: 8_000_000, framerate: FPS };
      // length-prefixed NAL units (what MP4 stores), never Annex B start codes
      if (c.mux === "avc") cfg.avc = { format: "avc" };
      try {
        const r = await VideoEncoder.isConfigSupported(cfg);
        if (r.supported) {
          video = { cfg, mux: c.mux };
          break;
        }
      } catch {
        /* next */
      }
    }
    if (!video) return null;
    if (!withAudio) return { video, audio: null };
    if (typeof AudioEncoder === "undefined" || typeof AudioData === "undefined") return null;
    for (const c of CODECS.audio)
      for (const sampleRate of [48000, 44100]) {
        const cfg = { codec: c.codec, sampleRate, numberOfChannels: 2, bitrate: 192_000 };
        try {
          const r = await AudioEncoder.isConfigSupported(cfg);
          if (r.supported) return { video, audio: { cfg, mux: c.mux } };
        } catch {
          /* next */
        }
      }
    return null; // no AAC here: the fallback keeps the sound
  }

  async function exportMp4(o, setup) {
    const { Muxer, ArrayBufferTarget } = window.Mp4Muxer;
    const target = new ArrayBufferTarget();
    const muxer = new Muxer({
      target,
      video: { codec: setup.video.mux, width: 1080, height: 1920, frameRate: FPS },
      audio: setup.audio ? { codec: setup.audio.mux, sampleRate: setup.audio.cfg.sampleRate, numberOfChannels: 2 } : undefined,
      fastStart: "in-memory",
      firstTimestampBehavior: "offset",
    });
    let failure = null;
    const venc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => (failure = e) });
    venc.configure(setup.video.cfg);

    // the clock: the song plays muted while frames are drawn on its time
    const el = new Audio();
    el.src = o.audioSrc;
    el.preload = "auto";
    el.muted = true;
    await new Promise((res, rej) => {
      if (el.readyState >= 3) return res();
      el.oncanplaythrough = res;
      el.onerror = () => rej(new Error("No se pudo leer el audio"));
    });
    const end = Math.min(o.duration || el.duration, el.duration || Infinity);

    // the sound, encoded straight from the file
    if (setup.audio) {
      const sr = setup.audio.cfg.sampleRate;
      const buf = await (await fetch(o.audioSrc)).arrayBuffer();
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const actx = new Ctx({ sampleRate: sr });
      let pcm;
      try {
        pcm = await actx.decodeAudioData(buf);
      } finally {
        actx.close && actx.close();
      }
      const aenc = new AudioEncoder({ output: (chunk, meta) => muxer.addAudioChunk(chunk, meta), error: (e) => (failure = e) });
      aenc.configure(setup.audio.cfg);
      const L = pcm.getChannelData(0);
      const R = pcm.numberOfChannels > 1 ? pcm.getChannelData(1) : L;
      const total = Math.min(pcm.length, Math.ceil(end * sr));
      const step = 4096;
      for (let i = 0; i < total; i += step) {
        const n = Math.min(step, total - i);
        const data = new Float32Array(n * 2);
        data.set(L.subarray(i, i + n), 0);
        data.set(R.subarray(i, i + n), n);
        const ad = new AudioData({ format: "f32-planar", sampleRate: sr, numberOfFrames: n, numberOfChannels: 2, timestamp: Math.round((i / sr) * 1e6), data });
        aenc.encode(ad);
        ad.close();
      }
      await aenc.flush();
      aenc.close();
    }

    if (WM.Fx) await WM.Fx.ready();
    const renderer = await WM.VideoRenderer.create(o.timeline, o.backgroundSrc, o.style);
    if (o.onCanvas) o.onCanvas(renderer.canvas);
    const sync = new WM.SyncEngine();
    sync.setTimeline(o.timeline);
    const frames = Math.max(1, Math.ceil(end * FPS));
    let next = 0;
    const put = () => {
      const vf = new VideoFrame(renderer.canvas, { timestamp: Math.round((next * 1e6) / FPS), duration: Math.round(1e6 / FPS) });
      venc.encode(vf, { keyFrame: next % (FPS * 2) === 0 });
      vf.close();
      next++;
    };
    let raf = 0;
    let aborted = false;
    try {
      renderer.draw(0, sync.stateAt(0));
      el.currentTime = 0;
      await el.play();
      await new Promise((resolve) => {
        const tick = () => {
          if (failure) return resolve();
          if (o.signal && o.signal.aborted) {
            aborted = true;
            return resolve();
          }
          const t = el.currentTime;
          // every 1/30 s slot gets a frame (a slow moment repeats the last one)
          if (next / FPS <= t) {
            renderer.draw(Math.min(t, end), sync.stateAt(Math.min(t, end)));
            while (next < frames && next / FPS <= t) put();
          }
          if (o.onProgress) o.onProgress(Math.min(t, end), end);
          if (el.ended || t >= end || next >= frames) return resolve();
          raf = requestAnimationFrame(tick);
        };
        el.onended = () => resolve();
        tick();
      });
      if (!aborted && !failure) {
        renderer.draw(end, sync.stateAt(end));
        while (next < frames) put();
        await venc.flush();
      }
    } finally {
      cancelAnimationFrame(raf);
      el.pause();
      renderer.dispose();
      if (venc.state !== "closed") venc.close();
    }
    if (aborted) throw Object.assign(new Error("Exportación cancelada"), { code: "cancelled" });
    if (failure) throw failure;
    muxer.finalize();
    return { blob: new Blob([target.buffer], { type: "video/mp4" }), ext: "mp4" };
  }

  /**
   * @param {{ timeline, audioSrc:string, backgroundSrc:string, duration:number,
   *           withAudio?:boolean, onProgress?(t, duration), onCanvas?(canvas),
   *           signal?:AbortSignal }} o
   * @returns {Promise<{ blob: Blob, ext: string }>}
   */
  async function exportVideo(o) {
    // a proper MP4 when the browser can encode one; the recorder otherwise
    const setup = await webCodecsSetup(o.withAudio !== false).catch(() => null);
    if (setup) return exportMp4(o, setup);
    return exportRecorded(o);
  }

  async function exportRecorded(o) {
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

  WM.Exporter = { exportVideo, saveFile, supported, pickType, CODECS };
})((window.WaveMusic = window.WaveMusic || {}));
