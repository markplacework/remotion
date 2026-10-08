// Wave Music · APP
// Wires the modules together. Flow:
//   audio (master clock) -> sync.stateAt(t) -> preview.render(state)
//   lyrics + provider    -> timestamps timeline -> sync + preview
//   ajuste manual        -> adjusted timeline   -> sync + preview
(function (WM) {
  const $ = (id) => document.getElementById(id);
  const T = WM.Timestamps;

  const audio = new WM.AudioEngine();
  const sync = new WM.SyncEngine();
  const preview = new WM.Preview($("stage-host"), {
    backgroundSrc: WM.ASSETS.background,
    layout: "mockup",
  });

  let parsed = { lines: [], embeddedStarts: null };
  let timeline = null;
  let scrubbing = false;
  let needsSnap = true;

  // Ajuste manual state
  const A = WM.Adjust;
  const history = new A.History();
  let adj = null; // Adjustments over the generated (baseline) timeline
  let selected = -1; // explicitly chosen line (-1 = follow playback)
  let scope = "line";
  let listenUntil = null;

  // ---------- helpers ----------
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.h);
    toast.h = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function setStep(n) {
    document.querySelectorAll("[data-step]").forEach((s) => {
      s.classList.toggle("done", Number(s.dataset.step) < n);
    });
  }

  function refreshReadiness() {
    const hasAudio = audio.loaded;
    const hasLyrics = parsed.lines.length > 0;
    $("btn-generate").disabled = !hasLyrics;
    $("transport").classList.toggle("disabled", !hasAudio);
    $("btn-export").disabled = !(hasAudio && timeline);
    $("btn-full").disabled = !timeline;
    $("audio-name").textContent = hasAudio ? audio.name : "Sin audio";
    $("audio-meta").textContent = hasAudio ? T.format(audio.duration) : "mp3 · wav · m4a";
    $("line-count").textContent = hasLyrics ? parsed.lines.length + " líneas" : "";
    setStep(timeline ? 4 : hasLyrics ? 3 : hasAudio ? 2 : 1);
  }

  // ---------- timeline ----------
  /** New lyrics/sync: rebuild everything and make it the new baseline. */
  function applyTimeline(tl) {
    timeline = tl;
    adj = tl ? new A.Adjustments(tl, audio.duration || tl.entries[tl.entries.length - 1].end) : null;
    selected = -1;
    history.clear();
    sync.setTimeline(tl);
    preview.setTimeline(tl);
    renderTimestampList();
    renderMarkers();
    $("sync-source").textContent = tl ? sourceLabel(tl.source) : "—";
    $("adjust").classList.toggle("disabled", !tl);
    needsSnap = true;
    refreshReadiness();
    refreshAdjustButtons();
  }

  /** Same lines, new times (manual adjust): no DOM rebuild, so dragging
   * the slider stays smooth. */
  function commitTimes() {
    const tl = adj.timeline();
    timeline = tl;
    sync.setTimeline(tl);
    preview.timeline = tl;
    document.querySelectorAll(".ts-row").forEach((row) => {
      const e = tl.entries[Number(row.dataset.index)];
      const input = row.querySelector(".ts-time");
      if (e && document.activeElement !== input) input.value = T.format(e.start, true);
    });
    renderMarkers();
    $("sync-source").textContent = sourceLabel(tl.source);
    needsSnap = true;
    refreshAdjustButtons();
  }

  function refreshAdjustButtons() {
    $("btn-undo").disabled = !history.canUndo;
    $("btn-reset").disabled = !adj || !adj.dirty;
  }

  /** Record the current adjustments so the next change can be undone. */
  function checkpoint() {
    if (adj) history.push(adj.snapshot());
  }

  function sourceLabel(id) {
    return (
      { interval: "Prueba · intervalo", spread: "Prueba · repartido", lrc: "LRC", demo: "Demo", manual: "Editado a mano", ai: "IA · OpenAI", modal: "IA precisa · Modal" }[
        id
      ] || id
    );
  }

  async function generate() {
    const providerId = $("sync-mode").value;
    const btn = $("btn-generate");
    const label = btn.textContent;
    btn.disabled = true;
    try {
      const tl = await T.generate(providerId, {
        lines: parsed.lines,
        embeddedStarts: parsed.embeddedStarts,
        duration: audio.duration,
        audio,
        askKey,
        askModal,
        onStatus: (s) => (btn.textContent = s),
        options: { interval: $("sync-interval").value, offset: $("sync-offset").value },
      });
      // word timings only stay valid for the AI sync that produced them
      if (!isAi(providerId)) WM.AiWords = {};
      applyTimeline(tl);
      audio.seek(0);
      const extra = isAi(providerId) && WM.AiSync.last ? ` · ${WM.AiSync.last.matched}/${WM.AiSync.last.total} palabras encontradas` : "";
      toast("Sincronización generada · " + tl.entries.length + " líneas" + extra);
    } catch (e) {
      if (e.code !== "cancelled") toast(e.message);
    } finally {
      btn.textContent = label;
      refreshReadiness();
      updateAiRow();
    }
  }

  const isAi = (mode) => mode === "ai" || mode === "modal";

  // ---------- servicio de Modal (versión de prueba) ----------
  function askModal(error) {
    return new Promise((resolve, reject) => {
      const m = $("modalcfg");
      const url = $("modalcfg-url");
      const token = $("modalcfg-token");
      const err = $("modalcfg-error");
      const showErr = (msg) => {
        err.textContent = msg || "";
        err.hidden = !msg;
      };
      url.value = WM.ModalSync.getUrl();
      token.value = WM.ModalSync.getToken();
      showErr(error);
      m.hidden = false;
      setTimeout(() => (url.value ? token : url).focus(), 30);
      const close = () => {
        m.hidden = true;
        $("modalcfg-ok").onclick = $("modalcfg-cancel").onclick = m.onkeydown = null;
      };
      $("modalcfg-ok").onclick = () => {
        const u = url.value.trim();
        const bad = WM.ModalSync.checkUrl(u);
        if (bad) return showErr(bad);
        WM.ModalSync.setConfig(u, token.value.trim());
        close();
        resolve({ url: WM.ModalSync.getUrl(), token: WM.ModalSync.getToken() });
      };
      $("modalcfg-cancel").onclick = () => {
        close();
        reject(Object.assign(new Error("Sincronización cancelada"), { code: "cancelled" }));
      };
      m.onkeydown = (e) => {
        if (e.key === "Enter") $("modalcfg-ok").click();
        if (e.key === "Escape") $("modalcfg-cancel").click();
      };
    });
  }

  // ---------- Wave Studio: herramientas ----------
  const VIEWS = { home: "", "remove-vocal": "Remove Vocal", lyrics: "Lyrics", karaoke: "Karaoke", captions: "Captions" };
  let view = "home";
  function route() {
    const v = location.hash.slice(1);
    const next = v in VIEWS ? v : "home";
    if (next !== "lyrics" && next !== "karaoke") closeFull();
    const enteringKaraoke = next === "karaoke" && view !== "karaoke";
    if (next !== view) document.querySelector("#lyrics-view .editor").scrollTop = 0;
    view = next;
    document.body.dataset.view = view;
    $("tool-crumb").textContent = VIEWS[view];
    $("tool-crumb").hidden = !VIEWS[view];
    $("karaoke-row").hidden = view !== "karaoke";
    if (view === "karaoke") {
      if (enteringKaraoke) chooseStyle("karaoke");
      ensureInstrumental();
    } else if (audio.playbackUrl) audio.usePlayback(null);
    needsSnap = true;
  }
  window.addEventListener("hashchange", route);

  // Home: slow sound waves behind the hero, only while the home is shown.
  (function homeWaves() {
    const c = $("studio-waves");
    const g = c.getContext("2d");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const waves = [
      { amp: 38, len: 0.0042, speed: 0.35, y: 0.3, col: "34,211,245", a: 0.22 },
      { amp: 52, len: 0.0031, speed: -0.25, y: 0.34, col: "30,139,255", a: 0.18 },
      { amp: 30, len: 0.0058, speed: 0.5, y: 0.38, col: "139,61,245", a: 0.16 },
    ];
    function draw(now) {
      requestAnimationFrame(draw);
      if (view !== "home" || document.hidden) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      const t = still ? 0 : now / 1000;
      waves.forEach((wv) => {
        const grad = g.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, `rgba(${wv.col},0)`);
        grad.addColorStop(0.5, `rgba(${wv.col},${wv.a})`);
        grad.addColorStop(1, `rgba(${wv.col},0)`);
        g.strokeStyle = grad;
        g.lineWidth = 2;
        g.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const env = Math.sin((x / w) * Math.PI);
          const y = h * wv.y + Math.sin(x * wv.len + t * wv.speed * 2) * wv.amp * env + Math.sin(x * wv.len * 2.3 - t * wv.speed) * wv.amp * 0.3 * env;
          x ? g.lineTo(x, y) : g.moveTo(x, y);
        }
        g.stroke();
      });
    }
    requestAnimationFrame(draw);
  })();

  /** The Modal service's URL and token, asking once if needed. */
  async function modalCreds(error) {
    if (!error && WM.ModalSync.isConfigured()) return { url: WM.ModalSync.getUrl(), token: WM.ModalSync.getToken() };
    return askModal(error);
  }
  // stems already separated, per song (same song asked twice runs once)
  const stemCache = new Map();
  async function getStem(song, stem) {
    const key = song.key + "|" + stem;
    if (stemCache.has(key)) return stemCache.get(key);
    let creds = await modalCreds();
    for (let attempt = 0; ; attempt++) {
      try {
        const blob = await WM.ModalSync.stems({ blob: song.blob, filename: song.name, stem, url: creds.url, token: creds.token });
        stemCache.set(key, blob);
        return blob;
      } catch (e) {
        if (e.code !== "auth" || attempt) throw e;
        WM.ModalSync.setConfig(creds.url, "");
        creds = await modalCreds(e.message + " Revisalo y probá de nuevo.");
      }
    }
  }
  const slugOf = (name) =>
    (name || "cancion")
      .replace(/\.[^.]+$/, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "cancion";

  // ----- Remove Vocal -----
  let splitSong = null; // { blob, name, key, demo }
  let splitStems = {};
  let splitKeySeq = 0;
  function pickSplit(song) {
    splitSong = { ...song, key: "split-" + ++splitKeySeq };
    splitStems = {};
    $("split-name").textContent = song.name.replace(/\.[^.]+$/, "");
    $("split-meta").textContent = (song.blob.size / 1e6).toFixed(1) + " MB · tocá para cambiar";
    $("split-drop").classList.add("picked");
    $("split-go").disabled = false;
    $("split-result").hidden = true;
  }
  $("split-file").onchange = (ev) => {
    const f = ev.target.files[0];
    ev.target.value = "";
    if (f) pickSplit({ blob: f, name: f.name });
  };
  $("split-demo").onclick = async () => {
    try {
      const blob = await (await fetch(WM.DEMO.audioSrc)).blob();
      pickSplit({ blob, name: "cancion-demo.mp3", demo: true });
    } catch {
      toast("No se pudo cargar la canción demo");
    }
  };
  function splitBusy(msg) {
    $("split-busy").hidden = !msg;
    if (msg) $("split-status").textContent = msg;
    $("split-go").disabled = !!msg || !splitSong;
    $("split-drop").classList.toggle("disabled", !!msg);
  }
  $("split-go").onclick = async () => {
    if (!splitSong) return;
    const song = splitSong;
    $("split-result").hidden = true;
    splitBusy("Separando la voz…");
    try {
      const inst = await getStem(song, "instrumental");
      if (song !== splitSong) return;
      splitStems.instrumental = inst;
      $("stem-inst").src = URL.createObjectURL(inst);
      $("dl-voc").disabled = true;
      $("stem-voc").removeAttribute("src");
      $("split-result").hidden = false;
      splitBusy("Preparando la voz sola…");
      const voc = await getStem(song, "vocals");
      if (song !== splitSong) return;
      splitStems.vocals = voc;
      $("stem-voc").src = URL.createObjectURL(voc);
      $("dl-voc").disabled = false;
      splitBusy("");
    } catch (e) {
      splitBusy("");
      if (e.code !== "cancelled") toast(e.message);
    }
  };
  async function saveStem(stem, suffix) {
    const blob = splitStems[stem];
    if (!blob) return;
    const res = await WM.Exporter.saveFile(blob, slugOf(splitSong.name) + suffix);
    toast(res.ok ? "Guardado" : res.message);
  }
  $("dl-inst").onclick = () => saveStem("instrumental", "-sin-voz.mp3");
  $("dl-voc").onclick = () => saveStem("vocals", "-voz.mp3");
  $("split-karaoke").onclick = async () => {
    if (!splitSong || !splitStems.instrumental) return;
    const song = splitSong;
    try {
      // load the song first (still on this page), hand Karaoke the
      // instrumental we already have, then switch
      if (song.demo) await loadDemo();
      else {
        const file = song.blob instanceof File ? song.blob : new File([song.blob], song.name, { type: song.blob.type || "audio/mpeg" });
        await audio.loadFile(file);
        analyzeEnergy();
        $("sp-title").value = audio.name;
        syncMeta();
        refreshReadiness();
      }
      stemCache.set(audio.sourceUrl + "|instrumental", splitStems.instrumental);
      location.hash = "karaoke";
      if (!song.demo) toast("Canción cargada · pegá la letra y sincronizá");
    } catch (e) {
      toast(e.message);
    }
  };

  // ----- Captions: film-style subtitles for any video -----
  /** Run a call against our Modal service, asking for the token once if needed. */
  async function withModal(run) {
    let creds = await modalCreds();
    for (let attempt = 0; ; attempt++) {
      try {
        return await run(creds);
      } catch (e) {
        if (e.code !== "auth" || attempt) throw e;
        WM.ModalSync.setConfig(creds.url, "");
        creds = await modalCreds(e.message + " Revisalo y probá de nuevo.");
      }
    }
  }
  const C = WM.Captions;
  const cap = { file: null, cues: [], opts: { style: "cine", scale: 1, pos: "bottom" }, url: null, active: -1, ctl: null };
  function capPick(file) {
    cap.file = file;
    $("cap-name").textContent = file.name.replace(/\.[^.]+$/, "");
    $("cap-meta").textContent = (file.size / 1e6).toFixed(1) + " MB · tocá para cambiar";
    $("cap-drop").classList.add("picked");
    $("cap-go").disabled = false;
  }
  $("cap-file").onchange = (ev) => {
    const f = ev.target.files[0];
    ev.target.value = "";
    if (f) capPick(f);
  };
  function capBusy(msg) {
    $("cap-busy").hidden = !msg;
    if (msg) $("cap-status").textContent = msg;
    $("cap-go").disabled = !!msg || !cap.file;
    $("cap-drop").classList.toggle("disabled", !!msg);
  }
  $("cap-go").onclick = async () => {
    if (!cap.file) return;
    try {
      capBusy("Sacando el audio del video…");
      const { wav, duration } = await C.extractWav(cap.file);
      capBusy("Escuchando el video…");
      const res = await withModal((creds) => C.transcribe({ wav, url: creds.url, token: creds.token }));
      const cues = C.buildCues(res.words || [], duration);
      if (!cues.length) throw new Error("No se escuchó ninguna voz en el video.");
      capOpen(cues);
    } catch (e) {
      if (e.code !== "cancelled") toast(e.message);
    } finally {
      capBusy("");
    }
  };
  // demo: the podcast clip with its subtitles already made, no wait
  $("cap-demo").onclick = async () => {
    const D = WM.DEMO_CAPTIONS;
    try {
      const blob = await (await fetch(D.videoSrc)).blob();
      capPick(new File([blob], D.name, { type: "video/mp4" }));
      capOpen(C.buildCues(D.words, D.duration));
      toast("Video demo · subtítulos hechos por la IA");
    } catch {
      toast("No se pudo cargar el video demo");
    }
  };
  function capOpen(cues) {
    cap.cues = cues;
    if (cap.url) URL.revokeObjectURL(cap.url);
    cap.url = URL.createObjectURL(cap.file);
    const v = $("cap-video");
    v.src = cap.url;
    v.onloadedmetadata = () => {
      $("cap-box").style.aspectRatio = v.videoWidth + " / " + v.videoHeight;
      $("cap-box").classList.toggle("portrait", v.videoHeight > v.videoWidth);
    };
    $("cap-start").hidden = true;
    $("cap-editor").hidden = false;
    capRenderList();
  }
  // player controls live under the picture, so nothing covers the subtitles
  {
    const v = $("cap-video");
    const toggle = () => (v.paused ? v.play() : v.pause());
    $("cap-play").onclick = toggle;
    $("cap-box").onclick = toggle;
    const sync = () => {
      $("cap-scrub").max = v.duration || 1;
      if (!capScrubbing) $("cap-scrub").value = v.currentTime;
      $("cap-clock").textContent = T.format(v.currentTime) + " / " + T.format(v.duration || 0);
      $("cap-play").classList.toggle("playing", !v.paused);
    };
    let capScrubbing = false;
    ["timeupdate", "play", "pause", "loadedmetadata", "seeked"].forEach((ev) => v.addEventListener(ev, sync));
    $("cap-scrub").addEventListener("input", () => {
      capScrubbing = true;
      v.currentTime = Number($("cap-scrub").value);
    });
    $("cap-scrub").addEventListener("change", () => (capScrubbing = false));
  }
  $("cap-new").onclick = () => {
    $("cap-video").pause();
    $("cap-editor").hidden = true;
    $("cap-start").hidden = false;
  };
  // style chips
  C.STYLES.forEach((st) => {
    const b = document.createElement("button");
    b.className = "cap-style";
    b.dataset.capstyle = st.id;
    b.setAttribute("aria-pressed", st.id === cap.opts.style);
    b.innerHTML = `<canvas width="240" height="96" aria-hidden="true"></canvas><span>${st.label}</span><small>${st.hint}</small>`;
    b.onclick = () => {
      cap.opts.style = st.id;
      document.querySelectorAll(".cap-style").forEach((x) => x.setAttribute("aria-pressed", x === b));
    };
    $("cap-styles").appendChild(b);
    // a frozen frame of the style: dark gradient, one line of subtitle
    const g = b.querySelector("canvas").getContext("2d");
    const bg = g.createLinearGradient(0, 0, 240, 96);
    bg.addColorStop(0, "#2a3346");
    bg.addColorStop(1, "#11151f");
    g.fillStyle = bg;
    g.fillRect(0, 0, 240, 96);
    C.drawCue(g, 240, 96, "Tus subtítulos", { style: st.id, scale: 3.6 });
  });
  $("cap-size").oninput = () => {
    cap.opts.scale = Number($("cap-size").value) / 100;
    $("cap-size-val").textContent = $("cap-size").value + "%";
  };
  document.querySelectorAll("[data-cappos]").forEach(
    (b) =>
      (b.onclick = () => {
        cap.opts.pos = b.dataset.cappos;
        document.querySelectorAll("[data-cappos]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      }),
  );
  // the cue list: time range + editable text
  const fmtCap = (t) => T.format(t, true);
  function capRenderList() {
    const list = $("cap-list");
    list.innerHTML = "";
    $("cap-count").textContent = cap.cues.length + " subtítulos";
    cap.cues.forEach((c, i) => {
      const row = document.createElement("div");
      row.className = "cap-row";
      row.innerHTML =
        '<div class="cap-times"><input class="cap-t" data-k="start" spellcheck="false" /><span>→</span><input class="cap-t" data-k="end" spellcheck="false" /></div>' +
        '<textarea class="cap-text" rows="2" spellcheck="true"></textarea>' +
        '<button class="cap-del" title="Borrar subtítulo" aria-label="Borrar subtítulo">×</button>';
      const [a, b] = row.querySelectorAll(".cap-t");
      a.value = fmtCap(c.start);
      b.value = fmtCap(c.end);
      [a, b].forEach((inp) =>
        inp.addEventListener("change", () => {
          const v = T.parse(inp.value);
          if (Number.isFinite(v)) c[inp.dataset.k] = Math.max(0, v);
          if (c.end <= c.start) c.end = c.start + 0.5;
          inp.value = fmtCap(c[inp.dataset.k]);
        }),
      );
      const ta = row.querySelector("textarea");
      ta.value = c.text;
      ta.addEventListener("input", () => (c.text = ta.value));
      ta.addEventListener("focus", () => {
        const v = $("cap-video");
        if (v.paused) v.currentTime = c.start + 0.01;
      });
      row.querySelector(".cap-times").addEventListener("click", (e) => {
        if (e.target.tagName !== "INPUT") $("cap-video").currentTime = c.start + 0.01;
      });
      row.querySelector(".cap-del").onclick = () => {
        cap.cues.splice(i, 1);
        capRenderList();
      };
      list.appendChild(row);
    });
    cap.active = -1;
  }
  // live overlay on the player
  (function capLoop() {
    requestAnimationFrame(capLoop);
    if (view !== "captions" || $("cap-editor").hidden) return;
    const v = $("cap-video");
    const c = $("cap-overlay");
    const box = $("cap-box");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(box.clientWidth * dpr);
    const h = Math.round(box.clientHeight * dpr);
    if (!w || !h) return;
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
    }
    const g = c.getContext("2d");
    // draw in the video's own pixel space, so it matches the export
    const W = v.videoWidth || 1920;
    const H = v.videoHeight || 1080;
    g.setTransform(w / W, 0, 0, h / H, 0, 0);
    g.clearRect(0, 0, W, H);
    const i = cap.cues.findIndex((q) => v.currentTime >= q.start && v.currentTime < q.end);
    if (i >= 0) C.drawCue(g, W, H, cap.cues[i].text, cap.opts);
    if (i !== cap.active) {
      cap.active = i;
      document.querySelectorAll(".cap-row").forEach((r, k) => r.classList.toggle("on", k === i));
      const row = document.querySelectorAll(".cap-row")[i];
      if (row && !v.paused) row.scrollIntoView({ block: "nearest" });
    }
  })();
  const capSlug = () => slugOf(cap.file ? cap.file.name : "video");
  $("cap-srt").onclick = async () => {
    const res = await WM.Exporter.saveFile(new Blob([C.toSRT(cap.cues)], { type: "text/plain" }), capSlug() + ".srt");
    toast(res.ok ? "SRT guardado" : res.message);
  };
  $("cap-vtt").onclick = async () => {
    const res = await WM.Exporter.saveFile(new Blob([C.toVTT(cap.cues)], { type: "text/vtt" }), capSlug() + ".vtt");
    toast(res.ok ? "VTT guardado" : res.message);
  };
  $("cap-export").onclick = async () => {
    if (cap.ctl) return;
    $("cap-video").pause();
    cap.ctl = new AbortController();
    $("cap-exporting").hidden = false;
    $("cap-export").disabled = true;
    try {
      const out = await C.burnIn({
        file: cap.file,
        cues: cap.cues,
        opts: { ...cap.opts },
        signal: cap.ctl.signal,
        onProgress: (t, d) => {
          $("cap-progress").style.width = (d ? (t / d) * 100 : 0) + "%";
          $("cap-time").textContent = T.format(t) + " / " + T.format(d);
        },
      });
      const res = await WM.Exporter.saveFile(out.blob, capSlug() + "-subtitulado." + out.ext);
      toast(res.ok ? "Video guardado" : res.message);
    } catch (e) {
      if (e.code !== "cancelled") toast(e.message || "No se pudo exportar el video");
    } finally {
      cap.ctl = null;
      $("cap-exporting").hidden = true;
      $("cap-export").disabled = false;
      $("cap-progress").style.width = "0%";
    }
  };
  $("cap-cancel").onclick = () => cap.ctl && cap.ctl.abort();

  // ----- Karaoke: the lyric editor playing the instrumental -----
  function karaokeStatus(state, msg) {
    $("karaoke-status").textContent = msg;
    $("karaoke-dot").dataset.state = state;
    $("karaoke-retry").hidden = state !== "error";
  }
  let karaokeFor = null;
  async function ensureInstrumental() {
    if (view !== "karaoke") return;
    if (!audio.loaded) return karaokeStatus("idle", "Cargá una canción: la voz se quita sola.");
    const key = audio.sourceUrl;
    const cached = stemCache.get(key + "|instrumental");
    if (cached) {
      if (!cached.url) cached.url = URL.createObjectURL(cached);
      await audio.usePlayback(cached.url);
      return karaokeStatus("ok", "Pista sin voz lista · el video sale en modo karaoke");
    }
    if (karaokeFor === key) return; // already separating this song
    karaokeFor = key;
    karaokeStatus("busy", "Quitando la voz con IA…");
    try {
      const blob = await (async () => {
        const buf = await audio.getArrayBuffer();
        const song = { blob: audio.sourceFile || new Blob([buf], { type: "audio/mpeg" }), name: audio.sourceFile ? audio.sourceFile.name : "cancion.mp3", key };
        return getStem(song, "instrumental");
      })();
      karaokeFor = null;
      if (audio.sourceUrl !== key) return;
      blob.url = URL.createObjectURL(blob);
      if (view === "karaoke") {
        await audio.usePlayback(blob.url);
        karaokeStatus("ok", "Pista sin voz lista · el video sale en modo karaoke");
      }
    } catch (e) {
      karaokeFor = null;
      karaokeStatus("error", e.code === "cancelled" ? "Hace falta el token de la IA para quitar la voz." : e.message);
    }
  }
  $("karaoke-retry").onclick = () => ensureInstrumental();

  // ---------- API key (versión de prueba) ----------
  function askKey(error) {
    return new Promise((resolve, reject) => {
      const m = $("aikey");
      const input = $("aikey-input");
      const err = $("aikey-error");
      const showErr = (msg) => {
        err.textContent = msg || "";
        err.hidden = !msg;
      };
      input.value = "";
      $("aikey-remember").checked = false;
      showErr(error);
      m.hidden = false;
      setTimeout(() => input.focus(), 30);
      const close = () => {
        m.hidden = true;
        $("aikey-ok").onclick = $("aikey-cancel").onclick = input.onkeydown = null;
      };
      $("aikey-ok").onclick = () => {
        const key = input.value.trim();
        const bad = WM.AiSync.checkKey(key);
        if (bad) return showErr(bad);
        WM.AiSync.setKey(key, $("aikey-remember").checked);
        close();
        resolve(key);
      };
      $("aikey-cancel").onclick = () => {
        close();
        reject(Object.assign(new Error("Sincronización cancelada"), { code: "cancelled" }));
      };
      input.onkeydown = (e) => {
        if (e.key === "Enter") $("aikey-ok").click();
        if (e.key === "Escape") $("aikey-cancel").click();
      };
    });
  }
  function updateAiRow() {
    const mode = $("sync-mode").value;
    $("ai-row").hidden = !isAi(mode);
    if (mode === "modal") {
      const has = WM.ModalSync.isConfigured();
      $("ai-key-state").textContent = has ? "Servicio de Modal configurado" : "Te va a pedir el token del servicio de Modal";
      $("ai-key-change").textContent = "Cambiar servicio";
      $("ai-key-change").hidden = !has;
    } else {
      $("ai-key-state").textContent = WM.AiSync.getKey() ? "API key de OpenAI cargada" : "Te va a pedir tu API key de OpenAI";
      $("ai-key-change").textContent = "Cambiar clave";
      $("ai-key-change").hidden = !WM.AiSync.getKey();
    }
  }
  $("ai-key-change").onclick = () => {
    if ($("sync-mode").value === "modal") WM.ModalSync.clearConfig();
    else WM.AiSync.clearKey();
    updateAiRow();
  };

  function renderTimestampList() {
    const list = $("ts-list");
    list.innerHTML = "";
    if (!timeline) {
      list.innerHTML = '<div class="ts-empty">Generá una sincronización para ver los tiempos.</div>';
      return;
    }
    timeline.entries.forEach((e, i) => {
      const row = document.createElement("div");
      row.className = "ts-row";
      row.dataset.index = i;
      row.innerHTML =
        '<input class="ts-time" spellcheck="false" />' +
        '<button class="ts-text" title="Ir a esta línea"></button>' +
        '<button class="ts-set" title="Fijar al tiempo actual">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2.5"/></svg>' +
        "</button>";
      const input = row.querySelector(".ts-time");
      input.value = T.format(e.start, true);
      row.querySelector(".ts-text").textContent = e.text;
      row.querySelector(".ts-text").onclick = () => {
        select(i);
        audio.seek(timeline.entries[i].start + 0.01);
      };
      input.onchange = () => {
        const v = T.parse(input.value);
        if (Number.isNaN(v)) return (input.value = T.format(timeline.entries[i].start, true));
        select(i);
        checkpoint();
        adj.setLineStart(i, v);
        commitTimes();
        input.value = T.format(timeline.entries[i].start, true);
      };
      input.onkeydown = (ev) => ev.key === "Enter" && input.blur();
      row.querySelector(".ts-set").onclick = () => {
        select(i);
        checkpoint();
        adj.setLineStart(i, audio.currentTime);
        commitTimes();
        toast("Línea " + (i + 1) + " → " + T.format(timeline.entries[i].start, true));
      };
      list.appendChild(row);
    });
  }

  function renderMarkers() {
    const box = $("markers");
    box.innerHTML = "";
    if (!timeline || !audio.duration) return;
    timeline.entries.forEach((e) => {
      const m = document.createElement("span");
      m.style.left = (e.start / audio.duration) * 100 + "%";
      box.appendChild(m);
    });
  }

  // ---------- loop: audio clock drives everything ----------
  let lastActive = -2;
  function frame() {
    const t = scrubbing ? Number($("scrub").value) : audio.currentTime;
    if (listenUntil != null && (t >= listenUntil || !audio.playing)) {
      if (audio.playing) audio.pause();
      listenUntil = null;
    }
    const state = sync.stateAt(t);
    preview.render(state, { playing: audio.playing, time: t, duration: audio.duration });
    needsSnap = false;
    renderAdjust(t, state);

    const d = audio.duration || 0;
    if (!scrubbing) $("scrub").value = t;
    $("progress").style.width = d ? (t / d) * 100 + "%" : "0";
    $("time-cur").textContent = T.format(t);
    $("time-dur").textContent = T.format(d);
    if (!$("full").hidden) {
      if (!fullScrubbing) $("full-scrub").value = t;
      $("full-scrub").max = d || 1;
      $("full-cur").textContent = T.format(t);
      $("full-dur").textContent = T.format(d);
    }

    if (state.activeIndex !== lastActive) {
      lastActive = state.activeIndex;
      const e = timeline && timeline.entries[state.activeIndex];
      $("now-line").textContent = e ? e.text : timeline ? "…" : "";
      document.querySelectorAll(".ts-row").forEach((r) => {
        r.classList.toggle("active", Number(r.dataset.index) === state.activeIndex);
      });
      const activeRow = document.querySelector(".ts-row.active");
      // Keep the active row in view inside the editor panel only —
      // never scroll the page itself (on mobile the preview is on top).
      const editor = document.querySelector(".editor");
      if (activeRow && audio.playing && editor.scrollHeight > editor.clientHeight + 1) {
        const r = activeRow.getBoundingClientRect();
        const box = editor.getBoundingClientRect();
        if (r.top < box.top || r.bottom > box.bottom) {
          editor.scrollBy({ top: r.top - box.top - box.height / 2, behavior: "smooth" });
        }
      }
    }
    requestAnimationFrame(frame);
  }

  // ---------- ajuste manual ----------
  function currentLine(state) {
    if (!timeline || !timeline.entries.length) return -1;
    if (selected >= 0) return Math.min(selected, timeline.entries.length - 1);
    return state && state.activeIndex >= 0 ? state.activeIndex : Math.max(0, (state ? state.visibleCount : 1) - 1);
  }

  function select(i) {
    selected = i;
  }

  const fmtMs = (v) => {
    const ms = Math.round(v * 1000);
    return ms === 0 ? "0 ms" : (ms > 0 ? "+" : "−") + Math.abs(ms) + " ms";
  };

  let lastAdjKey = "";
  function renderAdjust(t, state) {
    const i = currentLine(state);
    const e = timeline && timeline.entries[i];
    const key = e ? [i, e.start, scope, selected, adj.global, adj.line[i]].join() : "";
    if (key === lastAdjKey) return;
    lastAdjKey = key;
    $("sel-num").textContent = e ? i + 1 : "–";
    $("sel-text").textContent = e ? e.text : "";
    $("sel-start").textContent = e ? T.format(e.start, true) : "--:--.--";
    if (!e) return slider.set(0, [-A.RANGE, A.RANGE]);
    const v = scope === "all" ? adj.global : adj.line[i];
    slider.set(v, scope === "all" ? adj.globalRange() : adj.lineRange(i));
    $("adj-label").textContent = scope === "all" ? "Desplazamiento de todas las líneas" : "Desplazamiento de la línea " + (i + 1);
    $("adj-value").textContent = fmtMs(v);
    $("adj-value").classList.toggle("moved", v !== 0);
    document
      .querySelectorAll(".ts-row")
      .forEach((r) => r.classList.toggle("selected", Number(r.dataset.index) === i && selected >= 0));
  }

  /** Set the slider's value (line or global offset, in seconds). */
  function setOffset(v) {
    if (!adj) return;
    const i = currentLine(sync.stateAt(audio.currentTime));
    if (i < 0) return;
    if (selected < 0) select(i);
    if (scope === "all") adj.setGlobal(v);
    else adj.setLine(i, v);
    commitTimes();
    // While paused, park the playhead on the line's start so the preview
    // shows the bubble arriving at its new time.
    if (scope === "line" && !audio.playing) audio.seek(timeline.entries[i].start + 0.001);
  }

  function nudge(delta) {
    if (!adj) return;
    const i = currentLine(sync.stateAt(audio.currentTime));
    if (i < 0) return;
    checkpoint();
    setOffset((scope === "all" ? adj.global : adj.line[i]) + delta);
  }

  function listen() {
    if (!timeline) return;
    const i = currentLine(sync.stateAt(audio.currentTime));
    if (i < 0) return;
    const e = timeline.entries[i];
    audio.seek(Math.max(0, e.start - 1.5));
    listenUntil = Math.min(e.end, e.start + 4) + 0.4;
    audio.play();
  }

  function undo() {
    const prev = history.undo();
    if (!prev || !adj) return;
    adj.restore(prev);
    commitTimes();
    toast("Ajuste deshecho");
  }

  const slider = new WM.AdjustSlider($("adj-slider"), {
    min: -A.RANGE,
    max: A.RANGE,
    step: 0.01,
    onStart: checkpoint,
    onChange: setOffset,
    onEnd: () => {
      refreshAdjustButtons();
      // Hear the result right away when adjusting a single line.
      if (scope === "line" && !audio.playing) listen();
    },
  });

  document.querySelectorAll(".adj-step").forEach((b) => (b.onclick = () => nudge(Number(b.dataset.step))));
  document.querySelectorAll("[data-scope]").forEach((b) => {
    b.onclick = () => {
      document.querySelectorAll("[data-scope]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      scope = b.dataset.scope;
    };
  });
  $("btn-listen").onclick = listen;
  $("btn-undo").onclick = undo;
  $("btn-reset").onclick = () => {
    if (!adj || !adj.dirty) return;
    checkpoint();
    adj.reset();
    commitTimes();
    toast("Tiempos restablecidos");
  };

  // ---------- pantalla completa ----------
  // The stage element itself moves into the overlay (and back), so it's
  // the same live preview, just bigger. Native fullscreen is tried too,
  // but the overlay works where it's refused (e.g. inside an app frame).
  const host = $("stage-host");
  const homeSlot = { parent: host.parentNode, next: host.nextSibling };
  let fullScrubbing = false;

  function openFull() {
    if (!timeline) return;
    hideHint();
    $("full-name").textContent = audio.name || "Wave Music";
    $("full-stage").appendChild(host);
    $("full").hidden = false;
    needsSnap = true;
    const el = $("full");
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
  }
  function closeFull() {
    if ($("full").hidden) return;
    homeSlot.parent.insertBefore(host, homeSlot.next);
    $("full").hidden = true;
    needsSnap = true;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }
  // Lyrics Pro: drag the lyric anywhere on the canvas (TikTok style). It
  // snaps to the centre lines, which show while dragging. A tap without
  // movement still opens full screen.
  const SNAP = 0.03;
  const LIMIT = 0.45;
  let drag = null;
  let justDragged = false;
  host.addEventListener("pointerdown", (e) => {
    if (!preview.draggable || !timeline || e.button > 0 || e.target.closest(".empty-cta, button")) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, from: { ...preview.offset }, moved: false };
  });
  host.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    if (!drag.moved) {
      drag.moved = true;
      host.setPointerCapture(e.pointerId);
      host.classList.add("dragging");
      hideHint();
    }
    const d = preview.pointerToOffset(dx, dy);
    let x = Math.max(-LIMIT, Math.min(LIMIT, drag.from.x + d.x));
    let y = Math.max(-LIMIT, Math.min(LIMIT, drag.from.y + d.y));
    const snapX = Math.abs(x) < SNAP;
    const snapY = Math.abs(y) < SNAP;
    if (snapX) x = 0;
    if (snapY) y = 0;
    preview.setOffset({ x, y });
    preview.guides = { x: snapX, y: snapY };
    updateCenterBtn();
    e.preventDefault();
  });
  function endDrag(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    if (drag.moved) {
      justDragged = true;
      setTimeout(() => (justDragged = false), 0);
    }
    drag = null;
    preview.guides = null;
    host.classList.remove("dragging");
  }
  host.addEventListener("pointerup", endDrag);
  host.addEventListener("pointercancel", endDrag);
  function updateCenterBtn() {
    const o = preview.offset;
    $("btn-center").hidden = !(preview.draggable && (o.x || o.y));
  }
  $("btn-center").onclick = (e) => {
    e.stopPropagation();
    preview.setOffset({ x: 0, y: 0 });
    updateCenterBtn();
  };

  // One tap/click on the picture opens full screen. On desktop, hovering
  // also shows a small player overlay (play/pause + "Pantalla completa").
  host.addEventListener("click", (e) => {
    if (justDragged || !$("full").hidden || !timeline || e.target.closest(".empty-cta, button")) return;
    openFull();
  });
  $("ui-play").onclick = (e) => {
    e.stopPropagation();
    playPause();
  };
  $("ui-full").onclick = (e) => {
    e.stopPropagation();
    openFull();
  };
  $("btn-full").onclick = (e) => {
    e.stopPropagation();
    openFull();
  };
  $("full-close").onclick = closeFull;
  $("full-play").onclick = playPause;
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) closeFull();
  });
  const fs = $("full-scrub");
  fs.addEventListener("input", () => {
    fullScrubbing = true;
    audio.seek(Number(fs.value));
  });
  fs.addEventListener("change", () => (fullScrubbing = false));

  // Discoverability: the first time there is something to watch, a short
  // hint says the preview opens full screen (and opens it if tapped).
  let introShown = false;
  let hintTimer = 0;
  function introduceFullscreen() {
    if (introShown || !$("full").hidden) return;
    introShown = true;
    const touch = !window.matchMedia("(hover: hover)").matches;
    // Touch screens are narrow: break it into two even lines.
    $("full-hint-text").innerHTML = touch
      ? "Tocá para ver<br />en pantalla completa"
      : "Hacé clic para ver en pantalla completa";
    $("full-hint").classList.toggle("two-lines", touch);
    $("full-hint").hidden = false;
    hintTimer = setTimeout(hideHint, 5000);
  }
  function hideHint() {
    clearTimeout(hintTimer);
    const h = $("full-hint");
    if (h.hidden) return;
    h.classList.add("leaving");
    setTimeout(() => {
      h.hidden = true;
      h.classList.remove("leaving");
    }, 350);
  }
  $("full-hint").onclick = (e) => {
    e.stopPropagation();
    openFull();
  };

  // ---------- descargar video ----------
  let exportCtl = null;
  let exported = null;

  function exportStep(name) {
    document.querySelectorAll("[data-export]").forEach((el) => (el.hidden = el.dataset.export !== name));
  }
  function closeExport() {
    if (exportCtl) exportCtl.abort();
    $("export").hidden = true;
  }

  $("btn-export").onclick = () => {
    closeFull();
    if (!WM.Exporter.supported()) return toast("Este navegador no puede grabar video. Probá con Chrome.");
    if (!audio.loaded || !timeline) return;
    audio.pause();
    $("export-dur").textContent = T.format(audio.duration);
    exportStep("setup");
    $("export").hidden = false;
    $("export-start").focus();
  };
  document.querySelectorAll("[data-export-close]").forEach((b) => (b.onclick = closeExport));
  $("export-cancel").onclick = closeExport;

  $("export-start").onclick = async () => {
    exportStep("recording");
    $("export-canvas").innerHTML = "";
    exportCtl = new AbortController();
    try {
      exported = await WM.Exporter.exportVideo({
        timeline,
        // Karaoke exports the instrumental (same length as the song)
        audioSrc: audio.playbackUrl || audio.sourceUrl,
        backgroundSrc: WM.ASSETS.background,
        duration: audio.duration,
        withAudio: $("export-audio").checked,
        style: {
          theme: preview.theme.id,
          spotifyColor: preview.spotifyColor,
          meta: preview.meta,
          offset: preview.draggable ? preview.offset : null,
          textScale: preview.theme.kind === "motion" ? preview.textScale : 1,
          font: preview.theme.kind === "motion" ? preview.font : null,
        },
        signal: exportCtl.signal,
        onCanvas: (c) => $("export-canvas").appendChild(c),
        onProgress: (t, d) => {
          $("export-progress").style.width = (t / d) * 100 + "%";
          $("export-time").textContent = T.format(t) + " / " + T.format(d);
        },
      });
      const mb = (exported.blob.size / 1e6).toFixed(1);
      $("export-info").textContent = exported.ext.toUpperCase() + " · " + mb + " MB · " + T.format(audio.duration);
      exportStep("ready");
      $("export-save").focus();
    } catch (e) {
      if (e.code !== "cancelled") toast(e.message || "No se pudo exportar el video");
      $("export").hidden = true;
    } finally {
      exportCtl = null;
    }
  };

  $("export-save").onclick = async () => {
    if (!exported) return;
    const slug =
      (audio.name || "wave-music")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase() || "wave-music";
    const res = await WM.Exporter.saveFile(exported.blob, slug + "-lyric-video." + exported.ext);
    if (res.ok) {
      toast("Video guardado");
      $("export").hidden = true;
    } else toast(res.message);
  };

  // ---------- events ----------
  audio.on("play", () => document.body.classList.add("is-playing"));
  audio.on("pause", () => document.body.classList.remove("is-playing"));
  audio.on("ended", () => document.body.classList.remove("is-playing"));
  audio.on("seek", () => (needsSnap = true));
  audio.on("loadedmetadata", () => {
    $("scrub").max = audio.duration;
    renderMarkers();
    refreshReadiness();
  });

  // Play with nothing loaded starts the demo.
  function playPause() {
    return audio.loaded ? audio.toggle() : loadDemo();
  }
  $("btn-play").onclick = playPause;
  $("btn-back").onclick = () => audio.seek(audio.currentTime - 5);
  $("btn-fwd").onclick = () => audio.seek(audio.currentTime + 5);
  $("btn-restart").onclick = () => audio.seek(0);

  const scrub = $("scrub");
  scrub.addEventListener("pointerdown", () => (scrubbing = true));
  scrub.addEventListener("input", () => {
    scrubbing = true;
    needsSnap = true;
    audio.seek(Number(scrub.value));
  });
  const endScrub = () => {
    if (!scrubbing) return;
    scrubbing = false;
    audio.seek(Number(scrub.value));
  };
  scrub.addEventListener("change", endScrub);
  window.addEventListener("pointerup", endScrub);

  $("file-audio").onchange = async (ev) => {
    const f = ev.target.files[0];
    if (!f) return;
    try {
      await audio.loadFile(f);
      analyzeEnergy();
      $("sp-title").value = audio.name;
      $("sp-artist").value = "";
      syncMeta();
      toast("Audio cargado");
      if (view === "karaoke") ensureInstrumental();
      if (timeline) applyTimeline(T.buildTimeline(parsed.lines, timeline.entries.map((e) => e.start), audio.duration, timeline.source));
    } catch (e) {
      toast(e.message);
    }
    refreshReadiness();
  };

  let lyricsTimer;
  $("lyrics").addEventListener("input", () => {
    clearTimeout(lyricsTimer);
    lyricsTimer = setTimeout(() => {
      parsed = WM.Lyrics.parseLyrics($("lyrics").value);
      if (parsed.embeddedStarts) $("sync-mode").value = "lrc";
      onModeChange();
      refreshReadiness();
    }, 200);
  });

  function onModeChange() {
    const mode = $("sync-mode").value;
    $("field-interval").style.display = mode === "interval" ? "" : "none";
    $("field-offset").style.display = mode === "interval" || mode === "spread" ? "" : "none";
    $("btn-generate").textContent = isAi(mode) ? "Sincronizar con IA" : "Generar sincronización de prueba";
    updateAiRow();
  }
  $("sync-mode").onchange = onModeChange;
  $("btn-generate").onclick = generate;

  // ---------- ritmo (Lyrics Pro) ----------
  // Decoded once per song; presets read WM.Energy.current for the beat.
  let energyFor = null;
  async function analyzeEnergy() {
    const src = audio.sourceUrl;
    if (energyFor === src) return;
    energyFor = src;
    WM.Energy.current = null;
    try {
      const track = await WM.Motion.analyze(await audio.getArrayBuffer());
      if (energyFor === src) WM.Energy.current = track;
    } catch (e) {
      /* presets fall back to word onsets */
    }
  }

  // ---------- estilo ----------
  // Each option shows a tiny live-looking thumbnail of the style.
  const bars = (widths, cls) => widths.map((w) => `<i class="${cls}" style="width:${w}%"></i>`).join("");
  const THUMB = {
    whatsapp: `<div class="th th-wa" style="background-image:url('${WM.ASSETS.background}')">${bars([62, 48, 74], "b")}</div>`,
    instagram: `<div class="th th-ig">${bars([58, 44, 72], "b")}</div>`,
    messenger: `<div class="th th-ms">${bars([58, 44, 72], "b")}</div>`,
    spotify: `<div class="th th-sp"><i class="t"></i>${bars([78, 62, 84, 56], "l")}</div>`,
  };
  // Lyrics Pro thumbnails are the real presets, animated on a short sample.
  const SAMPLE_TL = {
    entries: [
      { lineId: "a", text: "Nunca voy a olvidarte", start: 0.2, end: 2.4 },
      { lineId: "b", text: "Siempre vuelvo a vos", start: 2.4, end: 4.8 },
    ],
  };
  const SAMPLES = { line: WM.Motion.prepare(SAMPLE_TL, "line"), word: WM.Motion.prepare(SAMPLE_TL, "word"), spread: WM.Motion.prepare(SAMPLE_TL, "spread") };
  const proThumbs = [];
  function drawThumbs(now) {
    const t = ((now / 1000) % 5.2) + 0.1;
    proThumbs.forEach(({ canvas, preset }) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round(r.width * dpr);
      const h = Math.round(r.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const g = canvas.getContext("2d");
      const W = 180;
      const H = (180 * h) / w;
      g.setTransform(w / W, 0, 0, h / H, 0, 0);
      preset.draw(g, WM.Motion.frame({ lines: SAMPLES[WM.Motion.modeFor(preset)], t, W, H, safe: { x: 12, y: 22, w: W - 24, h: H - 44 }, energy: null, meta: { title: "Mi canción" } }));
    });
  }
  let lastThumb = 0;
  (function thumbLoop(now) {
    if (now - lastThumb > 50 && !document.hidden) {
      lastThumb = now;
      drawThumbs(now);
    }
    requestAnimationFrame(thumbLoop);
  })(0);

  // Home hero: a real lyric video playing inside the phone mockup, cycling styles.
  (function heroScreen() {
    const c = $("hero-screen");
    if (!c) return;
    $("hero-tools").onclick = () => $("tools").scrollIntoView({ behavior: "smooth", block: "start" });
    // mobile sticky button: shown while neither the hero's nor the footer's button is on screen
    const seen = new Set();
    const io = new IntersectionObserver((list) => {
      list.forEach((en) => (en.isIntersecting ? seen.add(en.target) : seen.delete(en.target)));
      $("sticky-cta").classList.toggle("on", seen.size === 0);
    });
    [document.querySelector(".hero-ctas"), document.querySelector(".foot-cta")].forEach((el) => el && io.observe(el));
    $("more-reviews").onclick = () => $("reviews").classList.add("all");
    document.querySelectorAll("[data-scroll]").forEach((a) => {
      a.onclick = (e) => {
        e.preventDefault();
        $(a.dataset.scroll).scrollIntoView({ behavior: "smooth", block: "start" });
      };
    });
    const TL = {
      entries: [
        { lineId: "h1", text: "Bailando bajo la luna", start: 0.2, end: 1.9 },
        { lineId: "h2", text: "Tu voz en mi canción", start: 1.9, end: 3.6 },
        { lineId: "h3", text: "Esta noche es nuestra", start: 3.6, end: 5.6 },
      ],
    };
    const LOOP = 5.8;
    const lines = { line: WM.Motion.prepare(TL, "line"), word: WM.Motion.prepare(TL, "word"), spread: WM.Motion.prepare(TL, "spread") };
    const order = ["kinetic", "aurora", "karaoke", "couture", "neon", "wordpop"].map((id) => WM.Presets.get(id)).filter(Boolean);
    const tag = $("hero-style");
    // Aurora plays over the sample video, like a user's own background
    const heroVid = document.createElement("video");
    heroVid.muted = true;
    heroVid.loop = true;
    heroVid.playsInline = true;
    heroVid.preload = "auto";
    heroVid.src = WM.DEMO_BG.src;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let shown = -1;
    let last = 0;
    (function loop(now) {
      requestAnimationFrame(loop);
      if (view !== "home" || document.hidden) {
        if (!heroVid.paused) heroVid.pause();
        return;
      }
      if (now - last < 33) return;
      last = now;
      const r = c.getBoundingClientRect();
      if (!r.width) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round(r.width * dpr);
      const h = Math.round(r.height * dpr);
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      const sec = still ? 2.6 : now / 1000;
      const k = Math.floor(sec / LOOP) % order.length;
      const preset = order[k];
      if (k !== shown) {
        shown = k;
        tag.textContent = "Estilo: " + preset.label;
      }
      const g = c.getContext("2d");
      const W = 360;
      const H = (W * h) / w;
      g.setTransform(w / W, 0, 0, h / H, 0, 0);
      // keep the lyric clear of TikTok's side icons and caption
      const safe = { x: 26, y: H * 0.16, w: W - 92, h: H * 0.5 };
      const withVid = preset.id === "aurora";
      if (withVid && heroVid.paused) heroVid.play().catch(() => {});
      if (!withVid && !heroVid.paused) heroVid.pause();
      const video = withVid && heroVid.readyState >= 2 ? heroVid : null;
      preset.draw(g, WM.Motion.frame({ lines: lines[WM.Motion.modeFor(preset)], t: (sec % LOOP) + 0.05, W, H, safe, energy: null, video, meta: { title: "Tu canción", artist: "Artista" } }));
      // TikTok's own shade so its white UI reads over light styles
      g.setTransform(w / W, 0, 0, h / H, 0, 0);
      const top = g.createLinearGradient(0, 0, 0, H * 0.16);
      top.addColorStop(0, "rgba(0,0,0,.45)");
      top.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = top;
      g.fillRect(0, 0, W, H * 0.16);
      const bot = g.createLinearGradient(0, H * 0.62, 0, H);
      bot.addColorStop(0, "rgba(0,0,0,0)");
      bot.addColorStop(1, "rgba(0,0,0,.6)");
      g.fillStyle = bot;
      g.fillRect(0, H * 0.62, W, H * 0.38);
      const side = g.createLinearGradient(W * 0.78, 0, W, 0);
      side.addColorStop(0, "rgba(0,0,0,0)");
      side.addColorStop(1, "rgba(0,0,0,.28)");
      g.fillStyle = side;
      g.fillRect(W * 0.78, 0, W * 0.22, H);
    })(0);
  })();

  // ---------- video de fondo (Lyrics Pro) ----------
  function updateBgv() {
    const on = WM.BgVideo.enabled;
    $("bgv-name").textContent = on ? (WM.BgVideo.kind === "image" ? "Imagen: " : "Video: ") + WM.BgVideo.name : "";
    $("bgv-clear").hidden = !on;
    $("btn-bgs").hidden = on;
    $("bgv-filters").hidden = !on;
    $("bgv-filter-list").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.filter === WM.BgVideo.filter));
  }
  Object.entries(WM.BgVideo.FILTERS).forEach(([id, fl]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.dataset.filter = id;
    b.textContent = fl.label;
    b.onclick = () => {
      WM.BgVideo.filter = id;
      updateBgv();
      needsSnap = true;
    };
    $("bgv-filter-list").appendChild(b);
  });
  $("btn-bgs").onclick = async () => {
    $("bgv-name").textContent = "Cargando…";
    try {
      await WM.BgVideo.loadSample();
    } catch (err) {
      WM.BgVideo.clear();
      $("bgv-name").textContent = err.message;
    }
    updateBgv();
    needsSnap = true;
  };
  $("btn-bgv").onclick = () => $("file-bgv").click();
  $("btn-bgi").onclick = () => $("file-bgi").click();
  $("file-bgv").onchange = $("file-bgi").onchange = async (ev) => {
    const file = ev.target.files[0];
    ev.target.value = "";
    if (!file) return;
    $("bgv-name").textContent = "Cargando…";
    try {
      await WM.BgVideo.load(file);
      updateBgv();
    } catch (err) {
      WM.BgVideo.clear();
      updateBgv();
      $("bgv-name").textContent = err.message;
    }
    needsSnap = true;
  };
  $("bgv-clear").onclick = () => {
    WM.BgVideo.clear();
    updateBgv();
    needsSnap = true;
  };
  updateBgv();

  // ---------- texto: tipografía y tamaño (estilos animados) ----------
  {
    const sel = $("text-font");
    sel.innerHTML = '<option value="">Original del estilo</option>' + WM.Presets.FONTS.map((f) => `<option value="${f.id}">${f.label}</option>`).join("");
    sel.onchange = async () => {
      const f = WM.Presets.FONTS.find((x) => x.id === sel.value);
      if (f) await WM.Presets.loadFonts(f.family);
      preview.font = f ? f.family : null;
      needsSnap = true;
    };
    $("text-mode").onchange = () => {
      WM.Motion.wordMode = $("text-mode").value;
      preview.linesFor = null; // re-time the words
      needsSnap = true;
    };
    const size = $("text-size");
    size.oninput = () => {
      preview.textScale = Number(size.value) / 100;
      $("text-size-val").textContent = size.value + "%";
      needsSnap = true;
    };
    size.ondblclick = () => {
      size.value = 100;
      size.oninput();
    };
  }

  function chooseStyle(id) {
    document.querySelectorAll("#styles button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.style === id));
    $("spotify-opts").hidden = id !== "spotify";
    $("meta-opts").hidden = !(id === "spotify" || id === "minimal" || WM.Themes.get(id).meta);
    $("video-opts").hidden = !WM.Themes.get(id).video;
    // text size stays; the typeface goes back to the new style's own
    $("text-opts").hidden = WM.Themes.get(id).kind !== "motion";
    // word-paced styles (Word Pop, Blackout) don't offer the phrase mode
    const th = WM.Themes.get(id);
    $("text-mode-field").hidden = th.kind === "motion" && !!WM.Presets.get(th.preset).wordBased;
    $("text-font").value = "";
    preview.font = null;
    preview.setTheme(id);
    // each style has its own composition: start it centred
    preview.setOffset({ x: 0, y: 0 });
    updateCenterBtn();
    needsSnap = true;
  }
  WM.Themes.list.forEach((t) => {
    const b = document.createElement("button");
    b.dataset.style = t.id;
    const thumb = t.kind === "motion" ? `<canvas class="th th-pro" aria-hidden="true"></canvas>` : THUMB[t.id];
    const tag = t.kind === "motion" ? `<span class="style-tag">${WM.Presets.get(t.preset).tag}</span>` : "";
    b.innerHTML = `${thumb}<span class="style-name">${t.label}</span>${tag}<span class="style-check" aria-hidden="true"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>`;
    b.onclick = () => chooseStyle(t.id);
    $(t.kind === "motion" ? "styles-pro" : "styles-classic").appendChild(b);
    if (t.kind === "motion") proThumbs.push({ canvas: b.querySelector("canvas"), preset: WM.Presets.get(t.preset) });
  });
  WM.Presets.loadFonts();
  function paintSpotifyThumb(id) {
    const p = WM.Themes.spotifyPalette(id);
    const th = document.querySelector("#styles .th-sp");
    th.style.background = `linear-gradient(${p.bgTop}, ${p.bgBottom})`;
    th.querySelectorAll(".l").forEach((l, i) => (l.style.background = i === 2 ? "#fff" : p.line));
  }
  WM.Themes.SPOTIFY_COLORS.forEach((c) => {
    const b = document.createElement("button");
    b.dataset.color = c.id;
    b.title = c.label;
    b.setAttribute("aria-label", c.label);
    b.style.background = WM.Themes.spotifyPalette(c.id).swatch;
    b.onclick = () => {
      document.querySelectorAll("#sp-colors button").forEach((x) => x.setAttribute("aria-pressed", x === b));
      preview.setSpotifyColor(c.id);
      paintSpotifyThumb(c.id);
      needsSnap = true;
    };
    $("sp-colors").appendChild(b);
  });
  document.querySelector('#sp-colors [data-color="rojo"]').setAttribute("aria-pressed", "true");
  const syncMeta = () => preview.setMeta({ title: $("sp-title").value.trim(), artist: $("sp-artist").value.trim() });
  $("sp-title").addEventListener("input", syncMeta);
  $("sp-artist").addEventListener("input", syncMeta);
  chooseStyle("whatsapp");
  route();

  // Framing: the mockup is a preview aid; "Video final" is exactly what
  // gets exported (9:16, no device frame).
  document.querySelectorAll("[data-framing]").forEach((b) => {
    b.onclick = () => {
      document.querySelectorAll("[data-framing]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      preview.setLayout(b.dataset.framing);
    };
  });

  $("btn-demo").onclick = loadDemo;
  $("btn-demo-empty").onclick = loadDemo;

  async function loadDemo() {
    const D = WM.DEMO;
    $("lyrics").value = D.lyrics;
    $("sp-title").value = D.title;
    $("sp-artist").value = D.artist;
    syncMeta();
    parsed = WM.Lyrics.parseLyrics(D.lyrics);
    try {
      await audio.load(D.audioSrc, D.audioName);
      analyzeEnergy();
    } catch (e) {
      toast(e.message);
    }
    $("sync-mode").value = "ai";
    onModeChange();
    applyTimeline(T.buildTimeline(parsed.lines, D.starts, audio.duration, "demo"));
    audio.seek(0);
    audio.play();
    document.body.classList.add("has-demo");
    setTimeout(introduceFullscreen, 1200);
    if (view === "karaoke") ensureInstrumental();
  }

  document.addEventListener("keydown", (ev) => {
    if (!$("full").hidden && ev.key === "Escape") return closeFull();
    if (!$("export").hidden) {
      if (ev.key === "Escape" && !exportCtl) closeExport();
      return;
    }
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "z") {
      ev.preventDefault();
      return undo();
    }
    if (ev.code === "BracketLeft" || ev.code === "BracketRight") {
      ev.preventDefault();
      const step = ev.shiftKey ? 0.1 : 0.01;
      return nudge(ev.code === "BracketLeft" ? -step : step);
    }
    if (ev.code === "Space") {
      ev.preventDefault();
      playPause();
    } else if (ev.key === "ArrowLeft") audio.seek(audio.currentTime - 5);
    else if (ev.key === "ArrowRight") audio.seek(audio.currentTime + 5);
  });

  // Populate provider select from the registry, so new providers (AI)
  // show up automatically.
  Object.values(T.providers).forEach((p) => {
    const o = document.createElement("option");
    o.value = p.id;
    o.textContent = p.label;
    o.disabled = !!p.disabled;
    $("sync-mode").appendChild(o);
  });
  $("sync-mode").value = "ai";
  onModeChange();
  applyTimeline(null);
  requestAnimationFrame(frame);

  if (/[?&]demo\b/.test(location.search)) loadDemo();
})(window.WaveMusic);
