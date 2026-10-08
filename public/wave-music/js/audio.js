// Wave Music · AUDIO
// Thin wrapper around a single <audio> element. Everything else in the
// app reads time from here: the audio clock is the master clock that
// drives the lyrics.
(function (WM) {
  class AudioEngine {
    constructor() {
      this.el = new Audio();
      this.el.preload = "auto";
      this.name = "";
      this.objectUrl = null;
      this.listeners = {};
      ["loadedmetadata", "play", "pause", "ended", "error"].forEach((ev) =>
        this.el.addEventListener(ev, () => this.emit(ev)),
      );
    }

    on(ev, fn) {
      (this.listeners[ev] = this.listeners[ev] || []).push(fn);
    }

    emit(ev, data) {
      (this.listeners[ev] || []).forEach((fn) => fn(data));
    }

    /** Load from a URL. Resolves with the duration in seconds. */
    load(src, name) {
      this.pause();
      if (this.objectUrl && this.objectUrl !== src) {
        URL.revokeObjectURL(this.objectUrl);
        this.objectUrl = null;
      }
      this.name = name || "Audio";
      this.sourceUrl = src;
      this.playbackUrl = null;
      this.sourceFile = null;
      return new Promise((resolve, reject) => {
        const ok = () => {
          cleanup();
          resolve(this.duration);
        };
        const fail = () => {
          cleanup();
          reject(new Error("No se pudo cargar el audio"));
        };
        const cleanup = () => {
          this.el.removeEventListener("loadedmetadata", ok);
          this.el.removeEventListener("error", fail);
        };
        this.el.addEventListener("loadedmetadata", ok);
        this.el.addEventListener("error", fail);
        this.el.src = src;
        this.el.load();
      });
    }

    /** Load a user-picked File (mp3, wav, m4a...). */
    loadFile(file) {
      const url = URL.createObjectURL(file);
      const p = this.load(url, file.name.replace(/\.[^.]+$/, ""));
      this.objectUrl = url;
      this.sourceFile = file;
      return p;
    }

    /** Raw bytes of the current audio, for analysis (waveform, and
     * later AI alignment). Works for files, data: URIs and URLs. */
    async getArrayBuffer() {
      if (this.sourceFile) return this.sourceFile.arrayBuffer();
      const u = this.sourceUrl || "";
      if (u.startsWith("data:")) {
        const bin = atob(u.slice(u.indexOf(",") + 1));
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return bytes.buffer;
      }
      const res = await fetch(u);
      return res.arrayBuffer();
    }

    /**
     * Play another rendition of the same song (the karaoke instrumental)
     * while everything else — analysis, AI sync — keeps the original.
     * Same length, so the time carries over. null goes back to the original.
     */
    usePlayback(url) {
      const target = url || this.sourceUrl;
      this.playbackUrl = url || null;
      if (!target || this.el.src === target) return Promise.resolve();
      const t = this.el.currentTime || 0;
      const wasPlaying = this.playing;
      return new Promise((resolve) => {
        const ok = () => {
          this.el.removeEventListener("loadedmetadata", ok);
          this.el.currentTime = Math.min(t, this.el.duration || t);
          if (wasPlaying) this.el.play().catch(() => {});
          resolve();
        };
        this.el.addEventListener("loadedmetadata", ok);
        this.el.src = target;
        this.el.load();
      });
    }

    get loaded() {
      return this.duration > 0;
    }
    get duration() {
      return Number.isFinite(this.el.duration) ? this.el.duration : 0;
    }
    get currentTime() {
      return this.el.currentTime || 0;
    }
    get playing() {
      return !this.el.paused && !this.el.ended;
    }

    play() {
      if (!this.loaded) return Promise.resolve();
      if (this.el.ended) this.el.currentTime = 0;
      return this.el.play().catch(() => {});
    }
    pause() {
      this.el.pause();
    }
    toggle() {
      return this.playing ? this.pause() : this.play();
    }
    seek(t) {
      if (!this.loaded) return;
      this.el.currentTime = Math.max(0, Math.min(this.duration, t));
      this.emit("seek", this.el.currentTime);
    }
  }

  WM.AudioEngine = AudioEngine;
})((window.WaveMusic = window.WaveMusic || {}));
