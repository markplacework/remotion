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
      { interval: "Prueba · intervalo", spread: "Prueba · repartido", lrc: "LRC", demo: "Demo", manual: "Editado a mano" }[
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
        onStatus: (s) => (btn.textContent = s),
        options: { interval: $("sync-interval").value, offset: $("sync-offset").value },
      });
      // word timings only stay valid for the AI sync that produced them
      if (providerId !== "ai") WM.AiWords = {};
      applyTimeline(tl);
      audio.seek(0);
      const extra = providerId === "ai" && WM.AiSync.last ? ` · ${WM.AiSync.last.matched}/${WM.AiSync.last.total} palabras encontradas` : "";
      toast("Sincronización generada · " + tl.entries.length + " líneas" + extra);
    } catch (e) {
      if (e.code !== "cancelled") toast(e.message);
    } finally {
      btn.textContent = label;
      refreshReadiness();
      updateAiRow();
    }
  }

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
    const ai = $("sync-mode").value === "ai";
    $("ai-row").hidden = !ai;
    $("ai-key-state").textContent = WM.AiSync.getKey() ? "API key de OpenAI cargada" : "Te va a pedir tu API key de OpenAI";
    $("ai-key-change").hidden = !WM.AiSync.getKey();
  }
  $("ai-key-change").onclick = () => {
    WM.AiSync.clearKey();
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
        audioSrc: audio.sourceUrl,
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
    $("btn-generate").textContent = mode === "ai" ? "Sincronizar con IA" : "Generar sincronización de prueba";
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

  // ---------- video de fondo (Lyrics Pro) ----------
  function updateBgv() {
    const on = WM.BgVideo.enabled;
    $("bgv-name").textContent = on ? (WM.BgVideo.kind === "image" ? "Imagen: " : "Video: ") + WM.BgVideo.name : "";
    $("bgv-clear").hidden = !on;
  }
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
