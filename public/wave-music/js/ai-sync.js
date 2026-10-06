// Wave Music · SINCRONIZACIÓN CON IA (versión de prueba)
// OpenAI Whisper listens to the song and returns every sung word with its
// time; we then align those words to the user's lyrics, so each line gets
// its real start and each word its real timing (Lyrics Pro styles use
// them through WM.AiWords).
//
// Test only: the API key is typed by the user and used straight from the
// browser. The real product calls this from a backend (Supabase Edge
// Function) so the key never reaches the client.
(function (WM) {
  const STORE = "wm-openai-key";
  const MAX_BYTES = 25 * 1024 * 1024; // Whisper upload limit

  // ---------- key (session by default, or remembered on request) ----------
  function getKey() {
    try {
      return sessionStorage.getItem(STORE) || localStorage.getItem(STORE) || "";
    } catch {
      return memKey;
    }
  }
  let memKey = "";
  function setKey(key, remember) {
    memKey = key;
    try {
      sessionStorage.setItem(STORE, key);
      if (remember) localStorage.setItem(STORE, key);
      else localStorage.removeItem(STORE);
    } catch {
      /* storage blocked: keep it in memory */
    }
  }
  function clearKey() {
    memKey = "";
    try {
      sessionStorage.removeItem(STORE);
      localStorage.removeItem(STORE);
    } catch {
      /* ignore */
    }
  }
  /** Quick shape check before spending a request. */
  function checkKey(key) {
    if (!key) return "Pegá tu API key.";
    if (/^sk-ant-/.test(key)) return "Esa es una clave de Claude. Claude no puede escuchar audio, así que para sincronizar hace falta una clave de OpenAI (empieza con sk-).";
    if (!/^sk-[\w-]{20,}$/.test(key)) return "No parece una API key de OpenAI (empieza con sk-).";
    return "";
  }

  // ---------- transcription ----------
  async function transcribe({ blob, filename, key, prompt, signal }) {
    if (blob.size > MAX_BYTES) throw Object.assign(new Error("El audio pesa más de 25 MB, el límite de OpenAI. Probá con un mp3 más liviano."), { code: "size" });
    const fd = new FormData();
    fd.append("file", blob, filename);
    fd.append("model", "whisper-1");
    fd.append("response_format", "verbose_json");
    fd.append("timestamp_granularities[]", "word");
    // the lyrics as a hint: spelling and vocabulary of this song
    if (prompt) fd.append("prompt", prompt.slice(0, 600));
    let res;
    try {
      res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: "Bearer " + key },
        body: fd,
        signal,
      });
    } catch (e) {
      throw Object.assign(new Error("No se pudo conectar con OpenAI. Si estás en la vista previa de Claude, abrí el archivo descargado en Chrome."), { code: "network" });
    }
    if (res.status === 401) throw Object.assign(new Error("La API key no es válida."), { code: "auth" });
    if (res.status === 429) throw Object.assign(new Error("OpenAI rechazó el pedido por límite o falta de saldo en la cuenta."), { code: "quota" });
    if (!res.ok) {
      let msg = "";
      try {
        msg = (await res.json()).error.message;
      } catch {
        /* ignore */
      }
      throw new Error("OpenAI respondió con un error" + (msg ? ": " + msg : " (" + res.status + ")"));
    }
    const data = await res.json();
    return (data.words || []).map((w) => ({ text: w.word, start: w.start, end: w.end }));
  }

  // ---------- alignment ----------
  const norm = (s) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9ñ]/g, "");
  function lev(a, b) {
    const m = a.length;
    const n = b.length;
    if (!m || !n) return Math.max(m, n);
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  const sim = (a, b) => (a === b ? 1 : 1 - lev(a, b) / Math.max(a.length, b.length, 1));

  /**
   * Align lyric words to transcript words (monotonic, fuzzy): skipping a
   * sung word (repeats, ad-libs) is cheap, missing a lyric word costs more.
   * Returns, per line, its start and per-word times.
   */
  function align(lines, sung, duration) {
    const L = [];
    lines.forEach((l, li) =>
      l.text
        .split(/\s+/)
        .filter(Boolean)
        .forEach((w, wi) => L.push({ li, wi, text: w, n: norm(w) })),
    );
    const T = sung.map((w) => ({ ...w, n: norm(w.text) })).filter((w) => w.n);
    const n = L.length;
    const m = T.length;
    const GAP_L = 1.0;
    const GAP_T = 0.55;
    const W = m + 1;
    const cost = new Float32Array((n + 1) * W);
    const move = new Uint8Array((n + 1) * W); // 1 diag, 2 up (skip lyric), 3 left (skip sung)
    for (let i = 1; i <= n; i++) {
      cost[i * W] = i * GAP_L;
      move[i * W] = 2;
    }
    for (let j = 1; j <= m; j++) {
      cost[j] = j * GAP_T;
      move[j] = 3;
    }
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const s = sim(L[i - 1].n, T[j - 1].n);
        const d = cost[(i - 1) * W + j - 1] + (s >= 0.5 ? 1 - s : 1.6);
        const u = cost[(i - 1) * W + j] + GAP_L;
        const l = cost[i * W + j - 1] + GAP_T;
        let best = d;
        let mv = 1;
        if (u < best) {
          best = u;
          mv = 2;
        }
        if (l < best) {
          best = l;
          mv = 3;
        }
        cost[i * W + j] = best;
        move[i * W + j] = mv;
      }
    }
    // walk back: matched lyric words get the sung word's time
    for (let i = n, j = m; i > 0 || j > 0; ) {
      const mv = move[i * W + j];
      if (mv === 1) {
        if (sim(L[i - 1].n, T[j - 1].n) >= 0.5) {
          L[i - 1].t0 = T[j - 1].start;
          L[i - 1].t1 = T[j - 1].end;
        }
        i--;
        j--;
      } else if (mv === 2) i--;
      else j--;
    }

    // line starts: first matched word; lines with nothing matched are
    // spread between their neighbours
    const byLine = lines.map((_, li) => L.filter((w) => w.li === li));
    const starts = byLine.map((ws) => {
      const hit = ws.find((w) => w.t0 != null);
      return hit ? hit.t0 : null;
    });
    const dur = duration || (T.length ? T[T.length - 1].end + 2 : lines.length * 3);
    for (let i = 0; i < starts.length; i++) {
      if (starts[i] != null) continue;
      let a = i - 1;
      while (a >= 0 && starts[a] == null) a--;
      let b = i + 1;
      while (b < starts.length && starts[b] == null) b++;
      const ta = a >= 0 ? starts[a] : 0;
      const tb = b < starts.length ? starts[b] : dur;
      for (let k = a + 1; k < b; k++) starts[k] = ta + ((tb - ta) * (k - a)) / (b - a);
    }
    for (let i = 1; i < starts.length; i++) starts[i] = Math.max(starts[i], starts[i - 1]);

    // per-word times inside each line, relative to the line start
    const words = byLine.map((ws, li) => {
      const s = starts[li];
      const e = li + 1 < starts.length ? starts[li + 1] : dur;
      const known = ws.map((w) => (w.t0 != null ? [w.t0, w.t1] : null));
      for (let k = 0; k < ws.length; k++) {
        if (known[k]) continue;
        let a = k - 1;
        while (a >= 0 && !known[a]) a--;
        let b = k + 1;
        while (b < ws.length && !known[b]) b++;
        const ta = a >= 0 ? known[a][1] : s;
        const tb = b < ws.length ? known[b][0] : Math.min(e, ta + 0.4 * (b - a));
        const step = (tb - ta) / (b - a);
        for (let q = a + 1; q < b; q++) known[q] = [ta + step * (q - a - 1), ta + step * (q - a)];
      }
      return {
        text: lines[li].text,
        words: ws.map((w, k) => ({ text: w.text, d0: Math.max(0, known[k][0] - s), d1: Math.max(0.05, known[k][1] - s) })),
      };
    });
    const matched = L.filter((w) => w.t0 != null).length;
    return { starts, words, matched, total: n };
  }

  WM.AiSync = { getKey, setKey, clearKey, checkKey, transcribe, align };
  // lineId -> { text, words: [{ text, d0, d1 }] } (times relative to the line start)
  WM.AiWords = {};
})((window.WaveMusic = window.WaveMusic || {}));
