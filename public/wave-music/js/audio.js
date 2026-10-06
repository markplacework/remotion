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
      return p;
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
