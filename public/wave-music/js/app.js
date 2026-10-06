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
    preview.render(state, { playing: audio.playing, snap: needsSnap });
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
    host.classList.remove("ui-on");
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
  // Player overlay on the preview (like a video player): hover shows it
  // on desktop; on touch a tap shows it for a moment. Clicking the
  // picture itself plays/pauses; the overlay buttons do the rest.
  let uiTimer = 0;
  function showControls(ms = 2500) {
    host.classList.add("ui-on");
    clearTimeout(uiTimer);
    uiTimer = setTimeout(() => host.classList.remove("ui-on"), ms);
  }
  host.addEventListener("pointerup", (e) => {
    if (!$("full").hidden || e.target.closest(".empty-cta, button")) return;
    if (e.pointerType === "mouse") playPause();
    else if (host.classList.contains("ui-on")) host.classList.remove("ui-on");
    else showControls();
  });
  // Double-click the picture = full screen (as in most video players).
  host.addEventListener("dblclick", (e) => {
    if ($("full").hidden && !e.target.closest(".empty-cta, button")) openFull();
  });
  $("ui-play").onclick = (e) => {
    e.stopPropagation();
    playPause();
    showControls();
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

  // Discoverability: the first time there is something to watch, the
  // overlay shows itself for a few seconds so people see it exists.
  let introShown = false;
  function introduceControls() {
    if (introShown) return;
    introShown = true;
    showControls(3200);
  }

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
        audioSrc: audio.sourceUrl,
        backgroundSrc: WM.ASSETS.background,
        duration: audio.duration,
        withAudio: $("export-audio").checked,
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
      toast("Audio cargado");
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
    } catch (e) {
      toast(e.message);
    }
    $("sync-mode").value = "spread";
    onModeChange();
    applyTimeline(T.buildTimeline(parsed.lines, D.starts, audio.duration, "demo"));
    audio.seek(0);
    audio.play();
    document.body.classList.add("has-demo");
    setTimeout(introduceControls, 900);
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
  $("sync-mode").value = "interval";
  onModeChange();
  applyTimeline(null);
  requestAnimationFrame(frame);

  if (/[?&]demo\b/.test(location.search)) loadDemo();
})(window.WaveMusic);
