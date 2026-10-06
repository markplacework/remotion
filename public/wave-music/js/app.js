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
    mockupSrc: WM.ASSETS.mockup,
    layout: "mockup",
  });

  let parsed = { lines: [], embeddedStarts: null };
  let timeline = null;
  let scrubbing = false;
  let needsSnap = true;

  // Ajuste manual state
  const A = WM.Adjust;
  const history = new A.History();
  let baseline = null; // timeline as generated, before manual tweaks
  let selected = -1; // explicitly chosen line (-1 = follow playback)
  let scope = "line";
  let listenUntil = null;
  let dragging = false;

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
    $("audio-name").textContent = hasAudio ? audio.name : "Sin audio";
    $("audio-meta").textContent = hasAudio ? T.format(audio.duration) : "mp3 · wav · m4a";
    $("line-count").textContent = hasLyrics ? parsed.lines.length + " líneas" : "";
    setStep(timeline ? 4 : hasLyrics ? 3 : hasAudio ? 2 : 1);
  }

  // ---------- timeline ----------
  /** New lyrics/sync: rebuild everything and make it the new baseline. */
  function applyTimeline(tl) {
    timeline = tl;
    baseline = tl;
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
   * stays smooth. Pass record=false while a drag is in progress. */
  function commitTimes(tl, record = true) {
    if (record) history.push(timeline);
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
    $("btn-reset").disabled = !timeline || !baseline || timeline === baseline;
  }

  function sourceLabel(id) {
    return (
      { interval: "Prueba · intervalo", spread: "Prueba · repartido", lrc: "LRC", demo: "Demo", manual: "Editado a mano" }[
        id
      ] || id
    );
  }

  async function generate() {
    const providerId = $("sync-mode").value;
    try {
      const tl = await T.generate(providerId, {
        lines: parsed.lines,
        embeddedStarts: parsed.embeddedStarts,
        duration: audio.duration,
        audio,
        options: { interval: $("sync-interval").value, offset: $("sync-offset").value },
      });
      applyTimeline(tl);
      audio.seek(0);
      toast("Sincronización generada · " + tl.entries.length + " líneas");
    } catch (e) {
      toast(e.message);
    }
  }

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
        select(i, true);
        audio.seek(timeline.entries[i].start + 0.01);
      };
      input.onchange = () => {
        const v = T.parse(input.value);
        if (Number.isNaN(v)) return (input.value = T.format(timeline.entries[i].start, true));
        select(i);
        commitTimes(A.setStart(timeline, i, v, audio.duration));
        input.value = T.format(timeline.entries[i].start, true);
      };
      input.onkeydown = (ev) => ev.key === "Enter" && input.blur();
      row.querySelector(".ts-set").onclick = () => {
        select(i);
        commitTimes(A.setStart(timeline, i, audio.currentTime, audio.duration));
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
    preview.render(state, { playing: audio.playing, snap: needsSnap });
    needsSnap = false;
    renderAdjust(t, state);

    const d = audio.duration || 0;
    if (!scrubbing) $("scrub").value = t;
    $("progress").style.width = d ? (t / d) * 100 + "%" : "0";
    $("time-cur").textContent = T.format(t);
    $("time-dur").textContent = T.format(d);

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

  function select(i, center) {
    selected = i;
    if (center && timeline) strip.follow(timeline.entries[i].start, true);
  }

  let lastSelKey = "";
  function renderAdjust(t, state) {
    const i = currentLine(state);
    if (audio.playing) strip.follow(t);
    strip.draw({ timeline, time: t, selected: i, duration: audio.duration });

    const e = timeline && timeline.entries[i];
    const base = e && baseline && baseline.entries[i];
    const key = e ? [i, e.start, base && base.start, selected].join() : "";
    if (key === lastSelKey) return;
    lastSelKey = key;
    $("sel-num").textContent = e ? i + 1 : "–";
    $("sel-text").textContent = e ? e.text : "";
    $("sel-start").textContent = e ? T.format(e.start, true) : "--:--.--";
    const d = e && base ? Math.round((e.start - base.start) * 1000) : 0;
    $("sel-delta").textContent = d ? (d > 0 ? "+" : "−") + Math.abs(d) + " ms" : "original";
    $("sel-delta").classList.toggle("moved", !!d);
    document.querySelectorAll(".ts-row").forEach((r) => r.classList.toggle("selected", Number(r.dataset.index) === i && selected >= 0));
  }

  function nudge(delta) {
    if (!timeline) return;
    const i = currentLine(sync.stateAt(audio.currentTime));
    if (i < 0) return;
    if (selected < 0) select(i);
    const next = scope === "all" ? A.shiftAll(timeline, delta, audio.duration) : A.shiftLine(timeline, i, delta, audio.duration);
    commitTimes(next);
    if (!audio.playing) strip.follow(timeline.entries[i].start);
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
    if (!prev) return;
    commitTimes(prev, false);
    toast("Ajuste deshecho");
  }

  const strip = new WM.AdjustStrip($("strip"), {
    onSeek: (t) => {
      audio.seek(t);
      const s = sync.stateAt(t);
      selected = s.visibleCount - 1 >= 0 ? s.visibleCount - 1 : 0;
    },
    onDragStart: (i) => {
      dragging = true;
      select(i);
      history.push(timeline);
      refreshAdjustButtons();
    },
    onDrag: (i, t) => {
      commitTimes(A.setStart(timeline, i, t, audio.duration), false);
      if (!audio.playing) audio.seek(timeline.entries[i].start + 0.001);
    },
    onDragEnd: () => {
      dragging = false;
      refreshAdjustButtons();
    },
  });

  async function analyzeAudio() {
    const status = $("strip-status");
    strip.setPeaks(null);
    status.textContent = "Analizando audio…";
    try {
      const peaks = await WM.Waveform.computePeaks(await audio.getArrayBuffer());
      strip.setPeaks(peaks);
      status.textContent = "";
    } catch (e) {
      status.textContent = "Sin forma de onda";
    }
  }

  document.querySelectorAll("[data-nudge]").forEach((b) => (b.onclick = () => nudge(Number(b.dataset.nudge))));
  document.querySelectorAll("[data-zoom]").forEach((b) => {
    b.onclick = () => {
      document.querySelectorAll("[data-zoom]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      strip.setZoom(Number(b.dataset.zoom));
    };
  });
  document.querySelectorAll("[data-scope]").forEach((b) => {
    b.onclick = () => {
      document.querySelectorAll("[data-scope]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      scope = b.dataset.scope;
    };
  });
  $("btn-listen").onclick = listen;
  $("btn-undo").onclick = undo;
  $("btn-reset").onclick = () => {
    if (!baseline) return;
    commitTimes(baseline);
    toast("Tiempos restablecidos");
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

  $("btn-play").onclick = () => audio.toggle();
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
      toast("Audio cargado");
      analyzeAudio();
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
  }
  $("sync-mode").onchange = onModeChange;
  $("btn-generate").onclick = generate;

  // Framing: the mockup is a preview aid; "Video final" is exactly what
  // gets exported (9:16, no device frame).
  document.querySelectorAll("[data-framing]").forEach((b) => {
    b.onclick = () => {
      document.querySelectorAll("[data-framing]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      preview.setLayout(b.dataset.framing);
      $("framing-note").textContent =
        b.dataset.framing === "mockup" ? "El mockup es solo para la vista previa" : "Así queda el video descargado · 9:16";
    };
  });

  $("btn-demo").onclick = loadDemo;
  $("btn-demo-empty").onclick = loadDemo;

  async function loadDemo() {
    const D = WM.DEMO;
    $("lyrics").value = D.lyrics;
    parsed = WM.Lyrics.parseLyrics(D.lyrics);
    try {
      await audio.load(D.audioSrc, D.audioName);
      analyzeAudio();
    } catch (e) {
      toast(e.message);
    }
    $("sync-mode").value = "spread";
    onModeChange();
    applyTimeline(T.buildTimeline(parsed.lines, D.starts, audio.duration, "demo"));
    audio.seek(0);
    audio.play();
    document.body.classList.add("has-demo");
  }

  document.addEventListener("keydown", (ev) => {
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
      audio.toggle();
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
  $("sync-mode").value = "interval";
  onModeChange();
  applyTimeline(null);
  requestAnimationFrame(frame);

  if (/[?&]demo\b/.test(location.search)) loadDemo();
})(window.WaveMusic);
