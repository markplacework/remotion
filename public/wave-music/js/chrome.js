// Wave Music · INTERFAZ DEL MOCKUP
// For styles whose app UI isn't baked into a mockup image (Instagram,
// Messenger, Spotify), the phone's screen is drawn here in HTML: status
// bar, header and input bar / player controls. Preview only — the
// exported video never includes it. Coordinates are the cropped mockup
// stage's (see preview.js SCREEN_FULL).
(function (WM) {
  const FONT = WM.Themes.FONT_STACK;

  const ICON = {
    back: '<path d="M19 12H5M11 5l-7 7 7 7"/>',
    phone:
      '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3z"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-5M12 8h.01"/>',
    flag: '<path d="M4 22V4M4 4h13l-2 4 2 4H4"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>',
    sticker: '<path d="M21 12a9 9 0 1 1-9-9h9z"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
    plus: '<circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
    like: '<path d="M7 22V11M2 13v7a2 2 0 0 0 2 2h12.4a2 2 0 0 0 2-1.7l1.4-8A2 2 0 0 0 17.8 10H14V5a3 3 0 0 0-3-3l-4 9"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
    dots: '<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>',
  };
  function icon(name, size, color, { fill = "none", sw = 2 } = {}) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICON[name]}</svg>`;
  }
  const AVATAR = (size) =>
    `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#3a3b3c;display:grid;place-items:center;overflow:hidden;flex:none">` +
    `<svg width="${size}" height="${size}" viewBox="0 0 40 40"><circle cx="20" cy="15" r="7" fill="#b0b3b8"/><path d="M6 36c2-8 8-11 14-11s12 3 14 11z" fill="#b0b3b8"/></svg></div>`;

  function el(html, style) {
    const d = document.createElement("div");
    d.innerHTML = html;
    Object.assign(d.style, { position: "absolute", fontFamily: FONT, ...style });
    return d;
  }

  function statusBar(color) {
    return el(
      `<span style="font-weight:600;font-size:30px">09:38</span>` +
        `<span style="display:flex;gap:10px;align-items:center">` +
        `<svg width="34" height="22" viewBox="0 0 17 11" fill="${color}"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="2.5" width="3" height="8.5" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>` +
        `<svg width="30" height="22" viewBox="0 0 15 11" fill="${color}"><path d="M7.5 2.2c2 0 3.9.8 5.3 2.1l1.1-1.2A9 9 0 0 0 7.5.6 9 9 0 0 0 1.1 3.1l1.1 1.2a7.5 7.5 0 0 1 5.3-2.1zm0 3.1c1.2 0 2.3.5 3.1 1.2l1.1-1.2a6.1 6.1 0 0 0-8.4 0l1.1 1.2c.8-.7 1.9-1.2 3.1-1.2zm0 3.1c.4 0 .8.2 1.1.4L7.5 10 6.4 8.8c.3-.2.7-.4 1.1-.4z"/></svg>` +
        `<svg width="46" height="22" viewBox="0 0 25 12"><rect x=".5" y=".5" width="21" height="11" rx="3" fill="none" stroke="${color}" opacity=".5"/><rect x="2" y="2" width="18" height="8" rx="2" fill="${color}"/><path d="M23 4v4a2 2 0 0 0 0-4z" fill="${color}" opacity=".5"/></svg>` +
        `</span>`,
      { left: "37px", top: "31px", width: "726px", height: "96px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 64px 0 78px", boxSizing: "border-box", color },
    );
  }
  const homeBar = (color) =>
    el("", { left: "300px", top: "1690px", width: "200px", height: "8px", borderRadius: "4px", background: color });

  // ---------- Instagram / Messenger ----------
  function chatChrome(theme) {
    const ig = theme.id === "instagram";
    const accent = ig ? "#ffffff" : "#5647eb";
    const nodes = [statusBar("#fff")];
    nodes.push(
      el(
        `<span style="display:flex;align-items:center;gap:22px;min-width:0">${icon("back", 46, ig ? "#fff" : accent, { sw: 2.4 })}${AVATAR(72)}` +
          `<span style="display:flex;flex-direction:column;line-height:1.2">` +
          `<b style="font-size:30px;color:#fff;font-weight:${ig ? 700 : 600}">usuario</b>` +
          (ig ? `<span style="font-size:24px;color:#a8a8a8">usuario</span>` : `<span style="font-size:23px;color:#a8a8a8">Activo(a) ahora</span>`) +
          `</span></span>` +
          `<span style="display:flex;gap:34px">${icon("phone", 44, accent)}${icon("video", 46, accent)}${ig ? icon("flag", 44, accent) : icon("info", 46, accent)}</span>`,
        { left: "37px", top: "127px", width: "726px", height: "110px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px 0 28px", boxSizing: "border-box" },
      ),
    );
    if (ig) {
      nodes.push(
        el(
          `<span style="width:66px;height:66px;border-radius:50%;background:#3b5bff;display:grid;place-items:center;flex:none">${icon("camera", 34, "#fff", { sw: 2.2 })}</span>` +
            `<span style="flex:1;color:#a8a8a8;font-size:27px;padding-left:18px">Enviar mensaje...</span>` +
            `<span style="display:flex;gap:24px;padding-right:10px">${icon("mic", 38, "#fff")}${icon("image", 38, "#fff")}${icon("sticker", 38, "#fff")}${icon("plus", 38, "#fff")}</span>`,
          { left: "52px", top: "1566px", width: "696px", height: "84px", display: "flex", alignItems: "center", padding: "0 9px", boxSizing: "border-box", borderRadius: "42px", background: "#262626" },
        ),
      );
    } else {
      nodes.push(
        el(
          `<span style="display:flex;gap:22px;align-items:center"><svg width="44" height="44" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="${accent}"/><path d="M12 7v10M7 12h10" stroke="#000" stroke-width="2.4" stroke-linecap="round"/></svg>${icon("camera", 42, accent)}${icon("image", 42, accent)}${icon("mic", 42, accent)}</span>` +
            `<span style="flex:1;margin:0 16px;height:74px;border-radius:37px;background:#2a2a2b;display:flex;align-items:center;justify-content:space-between;padding:0 18px 0 26px;color:#a8a8a8;font-size:27px">Mensaje${icon("smile", 38, accent)}</span>` +
            icon("like", 46, accent, { fill: accent, sw: 1 }),
          { left: "37px", top: "1570px", width: "726px", height: "80px", display: "flex", alignItems: "center", padding: "0 22px", boxSizing: "border-box" },
        ),
      );
    }
    nodes.push(homeBar("#ffffff"));
    return { nodes, update() {} };
  }

  // ---------- Spotify ----------
  function spotifyChrome(theme, ctx) {
    const nodes = [statusBar("#fff")];
    const head = el(
      `<span style="position:absolute;left:30px;top:24px">${icon("chevron", 54, "#fff", { sw: 2.4 })}</span>` +
        `<b class="sp-title" style="display:block;font-family:${WM.Themes.LYRICS_FONT};font-size:31px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 120px"></b>` +
        `<span class="sp-artist" style="display:block;font-family:${WM.Themes.LYRICS_FONT};font-size:29px;color:#fff;opacity:.92;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 120px"></span>`,
      { left: "37px", top: "127px", width: "726px", height: "100px", textAlign: "center", lineHeight: "1.4", paddingTop: "8px", boxSizing: "border-box" },
    );
    nodes.push(head);
    const bottom = el(
      `<div style="display:flex;justify-content:space-between;padding:0 8px">${icon("share", 46, "#fff")}${icon("dots", 46, "#fff", { fill: "#fff", sw: 0 })}</div>` +
        `<div style="position:relative;height:6px;margin:40px 8px 0;border-radius:3px;background:rgba(255,255,255,.3)"><div class="sp-fill" style="position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:#fff"></div><div class="sp-knob" style="position:absolute;top:-8px;width:22px;height:22px;margin-left:-11px;border-radius:50%;background:#fff"></div></div>` +
        `<div style="display:flex;justify-content:space-between;margin:14px 8px 0;font-size:22px;color:rgba(255,255,255,.7)"><span class="sp-cur">0:00</span><span class="sp-dur">0:00</span></div>` +
        `<div style="display:flex;justify-content:center;margin-top:8px"><div style="width:124px;height:124px;border-radius:50%;background:#fff;display:grid;place-items:center"><svg class="sp-play" width="52" height="52" viewBox="0 0 24 24" fill="#000"><path d="M8 5v14l11-7z"/></svg><svg class="sp-pause" width="52" height="52" viewBox="0 0 24 24" fill="#000" style="display:none"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg></div></div>`,
      { left: "82px", top: "1388px", width: "636px", height: "320px" },
    );
    nodes.push(bottom);
    nodes.push(homeBar("rgba(255,255,255,.9)"));
    const $ = (sel) => head.querySelector(sel) || bottom.querySelector(sel);
    const fmt = (t) => {
      t = Math.max(0, t || 0);
      return Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0");
    };
    let lastKey = "";
    return {
      nodes,
      update({ time = 0, duration = 0, playing = false, title = "", artist = "" }) {
        const pct = duration ? Math.min(100, (time / duration) * 100) : 0;
        const key = [pct.toFixed(2), playing, title, artist, Math.floor(time), Math.floor(duration)].join("|");
        if (key === lastKey) return;
        lastKey = key;
        $(".sp-title").textContent = title || "Sin título";
        $(".sp-artist").textContent = artist || "";
        $(".sp-fill").style.width = pct + "%";
        $(".sp-knob").style.left = pct + "%";
        $(".sp-cur").textContent = fmt(time);
        $(".sp-dur").textContent = fmt(duration);
        $(".sp-play").style.display = playing ? "none" : "";
        $(".sp-pause").style.display = playing ? "" : "none";
      },
    };
  }

  WM.Chrome = {
    build(theme, ctx) {
      return theme.kind === "lyrics" ? spotifyChrome(theme, ctx) : chatChrome(theme, ctx);
    },
  };
})((window.WaveMusic = window.WaveMusic || {}));
