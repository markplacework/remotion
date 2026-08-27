// ── CATALOG DIRECTOR (inyectado por el proyecto de video) ──
// Reproduce de forma determinística, a partir de CERO en cada llamada, la
// demo de "agregar productos al carrito y enviar el pedido por WhatsApp"
// usando exclusivamente las funciones reales de esta página publicada
// (addToCart, openCartModal, sendCartToWA), nunca lógica inventada. Igual
// que el director del editor, esto permite que Remotion pida cualquier
// frame en cualquier orden y el resultado visual sea siempre el correcto
// para ese frame.
//
// Separado por completo del comportamiento propio de la página (carrusel
// de portadas, etc.) — este director nunca toca nada de eso, solo
// carrito/checkout.
window.__catalogDirector = (function () {
  var capturedMessage = null;

  // sendCartToWA() termina llamando a openWhatsApp(msg), que hace
  // window.open('https://wa.me/...') — un tab real que no tiene sentido
  // (ni es seguro) intentar abrir durante un render offline. Interceptamos
  // window.open para capturar el mensaje real que arma la app, sin
  // navegar a ningún lado. No inventa el texto: es exactamente el que la
  // función real generó.
  var realWindowOpen = window.open;
  window.open = function (url) {
    if (typeof url === "string" && url.indexOf("wa.me") !== -1) {
      var match = /[?&]text=([^&]*)/.exec(url);
      if (match) capturedMessage = decodeURIComponent(match[1]);
      return null;
    }
    return realWindowOpen.apply(window, arguments);
  };

  // El toast real es timer-driven — mismo problema que en el editor:
  // llamarlo en cada replay() lo dispararía decenas de veces por segundo.
  if (typeof showToast === "function") {
    showToast = function () {};
  }

  function killModalAnimation(overlayId) {
    var overlay = document.getElementById(overlayId);
    var inner = overlay && overlay.querySelector(".modal");
    if (inner) inner.style.animation = "none";
  }

  function resetToEmpty() {
    if (typeof closeCartModal === "function") closeCartModal();
    if (typeof cart !== "undefined" && Array.isArray(cart)) cart.length = 0;
    if (typeof updateCartUI === "function") updateCartUI();
    capturedMessage = null;
    resetButtonHighlights();
  }

  // Purely cosmetic — the real page gives no visual feedback on the
  // button itself when a product is added (only a toast, a temporary
  // pill, and the header count). Since this demo is a silent scripted
  // replay (real showToast() is disabled below), viewers had no way to
  // tell which product just got added — so the button for that product
  // gets a green ring + checkmark that stays for the rest of the scene,
  // a genuinely true "this one's in your cart" indicator, not invented
  // functionality.
  function getCartButtons() {
    var grid = document.getElementById("productGrid");
    return grid ? Array.prototype.slice.call(grid.querySelectorAll(".btn-cart")) : [];
  }

  function getSendButton() {
    return document.querySelector("#cartModal .btn-send-order");
  }

  function resetHighlightedButton(btn) {
    btn.style.transform = "";
    btn.style.boxShadow = "";
    if (btn.dataset.origHtml !== undefined) {
      btn.innerHTML = btn.dataset.origHtml;
      delete btn.dataset.origHtml;
    }
  }

  function resetButtonHighlights() {
    getCartButtons().forEach(resetHighlightedButton);
    var sendBtn = getSendButton();
    if (sendBtn) resetHighlightedButton(sendBtn);
  }

  function applyAddedHighlight(index, frame, cueFrame) {
    var btn = getCartButtons()[index];
    if (!btn) return;
    var local = frame - cueFrame;
    if (local < 0) return;

    if (btn.dataset.origHtml === undefined) {
      btn.dataset.origHtml = btn.innerHTML;
      btn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="vertical-align:-2px;margin-right:5px"><path d="M4 12.5l5 5L20 6" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>¡Agregado!';
    }

    var pulse = 1 - clamp01(local / 14);
    var scale = 1 + 0.1 * pulse;
    btn.style.transform = "scale(" + scale.toFixed(3) + ")";
    btn.style.boxShadow = "0 0 0 3px #ffffff, 0 0 0 6px #25D366, 0 8px 18px -6px rgba(37,211,102,0.65)";
  }

  // Same idea as applyAddedHighlight, for the "Enviar pedido por
  // WhatsApp" button itself — real click feedback is just the browser
  // opening a wa.me tab (intercepted/no-op during this scripted
  // replay), so without this the viewer has no visual cue the button
  // was ever pressed.
  function applySentHighlight(frame, cueFrame) {
    var btn = getSendButton();
    if (!btn) return;
    var local = frame - cueFrame;
    if (local < 0) return;

    if (btn.dataset.origHtml === undefined) {
      btn.dataset.origHtml = btn.innerHTML;
      btn.innerHTML =
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 12.5l5 5L20 6" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>¡Pedido enviado!';
    }

    var pulse = 1 - clamp01(local / 14);
    var scale = 1 + 0.06 * pulse;
    btn.style.transform = "scale(" + scale.toFixed(3) + ")";
    btn.style.boxShadow = "0 0 0 3px #ffffff, 0 0 0 6px #25D366, 0 8px 18px -6px rgba(37,211,102,0.65)";
  }

  function clamp01(n) {
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(1, n));
  }

  // cubic ease-out, matching the easing already used elsewhere in this
  // project's scroll/entrance interpolations.
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  async function replay(frame, cues) {
    resetToEmpty();

    // A full tour of the store before adding anything to the cart:
    // scroll all the way down to the bottom of the page first (so the
    // whole catalog — every product, the promo banner, everything —
    // gets shown, not just the products grid), then scroll back up to
    // the grid to actually add items.
    if (frame >= cues.scrollStart) {
      var grid = document.getElementById("productGrid");
      var gridTop = grid ? Math.max(0, grid.offsetTop - 96) : 0;
      var maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

      if (frame < cues.scrollBackStart) {
        var tDown = easeOutCubic(clamp01((frame - cues.scrollStart) / (cues.scrollDownEnd - cues.scrollStart)));
        window.scrollTo(0, maxScroll * tDown);
      } else {
        var tUp = easeOutCubic(clamp01((frame - cues.scrollBackStart) / (cues.scrollBackEnd - cues.scrollBackStart)));
        window.scrollTo(0, maxScroll + (gridTop - maxScroll) * tUp);
      }
    }

    if (frame >= cues.addItem1) {
      if (typeof addToCart === "function") addToCart(0);
      applyAddedHighlight(0, frame, cues.addItem1);
    }

    if (frame >= cues.addItem2) {
      if (typeof addToCart === "function") addToCart(1);
      applyAddedHighlight(1, frame, cues.addItem2);
    }

    if (frame >= cues.openCart) {
      if (typeof openCartModal === "function") openCartModal();
      killModalAnimation("cartModal");
    }

    if (frame >= cues.sendOrder) {
      if (typeof sendCartToWA === "function") sendCartToWA();
      applySentHighlight(frame, cues.sendOrder);
    }
  }

  function getCapturedMessage() {
    return capturedMessage;
  }

  return { replay: replay, getCapturedMessage: getCapturedMessage };
})();
