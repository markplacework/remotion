// Wave Music · BURBUJAS
// DOM port of src/components/DarkChatLog.tsx — same WhatsApp dark
// palette, radii, padding, font, read ticks, "Hoy" pill and the same
// spring entrance (damping 15, mass 0.6). Not a redesign: if the
// Remotion bubbles change, this file should follow them.
(function (WM) {
  const WA = {
    bubbleOut: "#005c4b",
    bubbleIn: "#202c33",
    text: "#e9edef",
    timestamp: "#8696a0",
    readTick: "#53bdeb",
  };
  const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

  // Same physics as remotion's spring({ config: { damping: 15, mass: 0.6 } })
  // (stiffness 100), solved in closed form so it depends only on time.
  const STIFF = 100;
  const MASS = 0.6;
  const DAMP = 15;
  const W0 = Math.sqrt(STIFF / MASS);
  const ZETA = DAMP / (2 * Math.sqrt(STIFF * MASS));
  const WD = W0 * Math.sqrt(1 - ZETA * ZETA);
  function spring(t) {
    if (t <= 0) return 0;
    if (t > 2) return 1;
    const e = Math.exp(-ZETA * W0 * t);
    return 1 - e * (Math.cos(WD * t) + ((ZETA * W0) / WD) * Math.sin(WD * t));
  }
  const lerp = (a, b, k) => a + (b - a) * k;

  const TICKS_SVG =
    '<svg width="16" height="11" viewBox="0 0 18 13" fill="none">' +
    `<path d="M1 6.8l3.6 3.6L11 3.6" stroke="${WA.readTick}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="M6.3 6.8l3.6 3.6L17 3.6" stroke="${WA.readTick}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>` +
    "</svg>";

  function el(tag, style, html) {
    const n = document.createElement(tag);
    if (style) Object.assign(n.style, style);
    if (html != null) n.innerHTML = html;
    return n;
  }

  function createHoyPill(label) {
    const wrap = el("div", { display: "flex", justifyContent: "center", marginBottom: "30px" });
    const pill = el("div", {
      background: "rgba(255,255,255,0.08)",
      color: WA.timestamp,
      fontFamily: FONT_STACK,
      fontSize: "15px",
      fontWeight: "600",
      padding: "5px 12px",
      borderRadius: "7px",
    });
    pill.textContent = label;
    wrap.appendChild(pill);
    return wrap;
  }

  /**
   * One lyric line as a WhatsApp bubble.
   * @param {{ text:string, clock:string, from?:'me'|'them', marginTop:number, fontSize?:number }} o
   */
  function createBubble(o) {
    const outgoing = (o.from || "me") === "me";
    const fontSize = o.fontSize || 22;

    const row = el("div", {
      display: "none",
      justifyContent: outgoing ? "flex-end" : "flex-start",
      transformOrigin: outgoing ? "top right" : "top left",
      marginTop: o.marginTop + "px",
      willChange: "transform, opacity",
    });
    const bubble = el("div", {
      background: outgoing ? WA.bubbleOut : WA.bubbleIn,
      color: WA.text,
      borderRadius: outgoing ? "14px 3px 14px 14px" : "3px 14px 14px 14px",
      padding: "9px 12px 8px",
      maxWidth: "82%",
      transition: "filter 260ms ease",
    });
    const text = el("div", { fontFamily: FONT_STACK, fontSize: fontSize + "px", lineHeight: "1.32" });
    text.textContent = o.text;
    const meta = el("div", {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: "4px",
      marginTop: "2px",
    });
    // "Now playing" marker — the only addition to the original bubble.
    const eq = el("span", {}, "<i></i><i></i><i></i>");
    eq.className = "wm-eq";
    const clock = el("span", { fontFamily: FONT_STACK, fontSize: fontSize * 0.68 + "px", color: WA.timestamp });
    clock.textContent = o.clock;
    meta.append(eq, clock);
    if (outgoing) meta.appendChild(el("span", { display: "inline-flex" }, TICKS_SVG));
    bubble.append(text, meta);
    row.appendChild(bubble);

    let last = "";
    return {
      root: row,
      /** @param {{ age:number, active:boolean, playing:boolean }} s */
      update(s) {
        if (s.age < 0) {
          if (last !== "hidden") row.style.display = "none";
          last = "hidden";
          return;
        }
        const enter = spring(s.age);
        const scale = lerp(0.85, 1, enter);
        const ty = lerp(14, 0, enter);
        const opacity = Math.min(enter, 1) * (s.active ? 1 : 0.78);
        const key = [scale.toFixed(4), ty.toFixed(2), opacity.toFixed(3), s.active, s.playing].join();
        if (key === last) return;
        last = key;
        row.style.display = "flex";
        row.style.opacity = opacity;
        row.style.transform = `translateY(${ty}px) scale(${scale})`;
        bubble.style.filter = s.active ? "brightness(1.12)" : "none";
        eq.classList.toggle("on", s.active);
        eq.classList.toggle("playing", s.active && s.playing);
      },
    };
  }

  WM.Bubbles = { createBubble, createHoyPill, WA, FONT_STACK };
})((window.WaveMusic = window.WaveMusic || {}));
