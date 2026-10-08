// Wave Music · SINCRONIZACIÓN PRECISA (Modal)
// Sends the song and the lyrics to our own GPU service on Modal
// (services/wave-music-sync): Demucs isolates the voice and WhisperX
// force-aligns the known lyrics on it. It answers in the same shape
// ai-sync.js produces ({ starts, words }), so the rest of the app doesn't
// care which provider ran.
//
// Our deployed service is DEFAULT_URL and asks for a token (typed once and
// kept in this browser). Another URL can be set from the dialog.
(function (WM) {
  // Printed by `modal deploy services/wave-music-sync/app.py`; it requires a token.
  const DEFAULT_URL = "https://builder-ai92--wave-music-sync-syncer-web.modal.run";
  const URL_STORE = "wm-modal-url";
  const TOKEN_STORE = "wm-modal-token";
  const MAX_BYTES = 60 * 1024 * 1024;

  const mem = {};
  function read(k) {
    try {
      return localStorage.getItem(k) || "";
    } catch {
      return mem[k] || "";
    }
  }
  function write(k, v) {
    mem[k] = v;
    try {
      if (v) localStorage.setItem(k, v);
      else localStorage.removeItem(k);
    } catch {
      /* storage blocked: keep it in memory */
    }
  }

  const getUrl = () => read(URL_STORE) || DEFAULT_URL;
  const getToken = () => read(TOKEN_STORE);
  // ready to call without asking: our service needs a token, other URLs may not
  const isConfigured = () => !!getUrl() && (!!getToken() || getUrl() !== DEFAULT_URL);
  function setConfig(url, token) {
    write(URL_STORE, url.replace(/\/+$/, ""));
    write(TOKEN_STORE, token);
  }
  function clearConfig() {
    write(URL_STORE, "");
    write(TOKEN_STORE, "");
  }
  function checkUrl(url) {
    if (!url) return "Pegá la URL del servicio.";
    if (!/^https:\/\/[\w.-]+(\/.*)?$/.test(url)) return "La URL tiene que empezar con https://";
    return "";
  }

  async function sync({ blob, filename, lines, url, token, signal }) {
    if (blob.size > MAX_BYTES) throw Object.assign(new Error("El audio pesa más de 60 MB. Probá con un mp3 más liviano."), { code: "size" });
    const fd = new FormData();
    fd.append("audio", blob, filename);
    fd.append("lyrics", lines.map((l) => l.text).join("\n"));
    fd.append("language", "es");
    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: token ? { Authorization: "Bearer " + token } : {},
        body: fd,
        signal,
      });
    } catch {
      throw Object.assign(new Error("No se pudo conectar con el servicio de Modal. Revisá la URL."), { code: "network" });
    }
    if (res.status === 401) throw Object.assign(new Error("El token del servicio no es válido."), { code: "auth" });
    if (res.status === 404) throw Object.assign(new Error("No hay ningún servicio en esa URL."), { code: "auth" });
    if (!res.ok) {
      let msg = "";
      try {
        msg = (await res.json()).detail;
      } catch {
        /* ignore */
      }
      throw new Error("El servicio respondió con un error" + (msg ? ": " + msg : " (" + res.status + ")"));
    }
    const data = await res.json();
    if (!Array.isArray(data.starts) || data.starts.length !== lines.length) throw new Error("El servicio devolvió tiempos que no coinciden con la letra");
    return data;
  }

  /** Remove Vocal: one stem of the song ("instrumental" or "vocals") as an MP3 blob. */
  async function stems({ blob, filename, stem, url, token, signal }) {
    if (blob.size > MAX_BYTES) throw Object.assign(new Error("El audio pesa más de 60 MB. Probá con un mp3 más liviano."), { code: "size" });
    const fd = new FormData();
    fd.append("audio", blob, filename);
    fd.append("stem", stem);
    let res;
    try {
      res = await fetch(url.replace(/\/+$/, "") + "/stems", {
        method: "POST",
        headers: token ? { Authorization: "Bearer " + token } : {},
        body: fd,
        signal,
      });
    } catch {
      throw Object.assign(new Error("No se pudo conectar con la IA. Si estás en la vista previa de Claude, abrí el archivo descargado en Chrome."), { code: "network" });
    }
    if (res.status === 401) throw Object.assign(new Error("El token del servicio no es válido."), { code: "auth" });
    if (res.status === 404) throw Object.assign(new Error("El servicio no tiene Remove Vocal todavía."), { code: "missing" });
    if (!res.ok) {
      let msg = "";
      try {
        msg = (await res.json()).detail;
      } catch {
        /* ignore */
      }
      throw new Error("No se pudo separar la voz" + (msg ? ": " + msg : " (" + res.status + ")"));
    }
    return res.blob();
  }

  WM.ModalSync = { getUrl, getToken, isConfigured, setConfig, clearConfig, checkUrl, sync, stems };
})((window.WaveMusic = window.WaveMusic || {}));
