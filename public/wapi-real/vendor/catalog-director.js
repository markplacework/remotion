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

    if (frame >= cues.scrollStart) {
      var grid = document.getElementById("productGrid");
      if (grid) {
        var targetTop = Math.max(0, grid.offsetTop - 96);
        var t = easeOutCubic(clamp01((frame - cues.scrollStart) / (cues.scrollEnd - cues.scrollStart)));
        window.scrollTo(0, targetTop * t);
      }
    }

    if (frame >= cues.addItem1) {
      if (typeof addToCart === "function") addToCart(0);
    }

    if (frame >= cues.addItem2) {
      if (typeof addToCart === "function") addToCart(1);
    }

    if (frame >= cues.openCart) {
      if (typeof openCartModal === "function") openCartModal();
      killModalAnimation("cartModal");
    }

    if (frame >= cues.sendOrder) {
      if (typeof sendCartToWA === "function") sendCartToWA();
    }
  }

  function getCapturedMessage() {
    return capturedMessage;
  }

  return { replay: replay, getCapturedMessage: getCapturedMessage };
})();
