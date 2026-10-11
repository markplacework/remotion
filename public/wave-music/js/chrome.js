// Wave Music · INTERFAZ DEL MOCKUP
// Spotify's player UI isn't baked into a mockup image, so its screen is
// drawn here in HTML (status bar, title/artist, player controls) over the
// frame-only phone. Preview only — the
// exported video never includes it. Coordinates are the cropped mockup
// stage's (see preview.js SCREEN_FULL).
(function (WM) {
  const FONT = WM.Themes.FONT_STACK;
  // Font stack safe inside a double-quoted style="" attribute.
  const LYRICS_ATTR = WM.Themes.LYRICS_FONT.replace(/"/g, "'");

  const ICON = {
    chevron: '<path d="M6 9l6 6 6-6"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
    dots: '<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>',
  };
  function icon(name, size, color, { fill = "none", sw = 2 } = {}) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICON[name]}</svg>`;
  }

  function el(html, style) {
    const d = document.createElement("div");
    d.innerHTML = html;
    Object.assign(d.style, { position: "absolute", fontFamily: FONT, ...style });
    return d;
  }

  function statusBar(color) {
    return el(
      `<span class="sb-time" style="font-weight:600;font-size:30px">${WM.clockNow()}</span>` +
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

  // ---------- Spotify ----------
  function spotifyChrome(theme, ctx) {
    const nodes = [statusBar("#fff")];
    const statusTime = nodes[0].querySelector(".sb-time");
    const head = el(
      `<span style="position:absolute;left:30px;top:24px">${icon("chevron", 54, "#fff", { sw: 2.4 })}</span>` +
        `<b class="sp-title" style="display:block;font-family:${LYRICS_ATTR};font-size:31px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 120px"></b>` +
        `<span class="sp-artist" style="display:block;font-family:${LYRICS_ATTR};font-size:29px;color:#fff;opacity:.92;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 120px"></span>`,
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
        const key = [pct.toFixed(2), playing, title, artist, Math.floor(time), Math.floor(duration), WM.clockNow()].join("|");
        if (key === lastKey) return;
        lastKey = key;
        statusTime.textContent = WM.clockNow();
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
      return spotifyChrome(theme, ctx);
    },
    /** Just the status bar (and home indicator), for Lyrics Pro mockups. */
    status(ink) {
      const bar = statusBar(ink);
      const time = bar.querySelector(".sb-time");
      return {
        nodes: [bar, homeBar(ink)],
        update() {
          const now = WM.clockNow();
          if (time.textContent !== now) time.textContent = now;
        },
      };
    },
  };
})((window.WaveMusic = window.WaveMusic || {}));
