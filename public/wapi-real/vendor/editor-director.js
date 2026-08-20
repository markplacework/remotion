// ── DIRECTOR (inyectado por el proyecto de video) ──
// Reproduce de forma determinística, a partir de CERO en cada llamada, la
// demo de "configurar el negocio + agregar un producto" usando
// exclusivamente las funciones reales de este editor (triggerLogoUpload,
// editBusiness/saveBusinessInfo, handlePortadaUpload, openAddModal/
// saveProduct, etc.), nunca lógica inventada. Esto permite que Remotion
// pida cualquier frame en cualquier orden y el resultado visual sea
// siempre el correcto para ese frame.
window.__wapiDirector = (function () {
  function setValue(id, value) {
    var el = document.getElementById(id);
    if (!el) return;
    el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function typedSlice(full, progress01) {
    var n = Math.round(full.length * Math.max(0, Math.min(1, progress01)));
    return full.slice(0, n);
  }

  function dataUrlToFile(dataUrl, filename) {
    return fetch(dataUrl)
      .then(function (res) {
        return res.blob();
      })
      .then(function (blob) {
        return new File([blob], filename, { type: blob.type || "image/jpeg" });
      });
  }

  function urlToFile(url, filename) {
    return fetch(url)
      .then(function (r) {
        return r.blob();
      })
      .then(function (blob) {
        return new Promise(function (resolve) {
          var reader = new FileReader();
          reader.onload = function () {
            resolve(reader.result);
          };
          reader.readAsDataURL(blob);
        });
      })
      .then(function (dataUrl) {
        return dataUrlToFile(dataUrl, filename);
      });
  }

  function dispatchFileTo(inputId, file) {
    var input = document.getElementById(inputId);
    if (!input) return Promise.resolve();
    var dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return Promise.resolve();
  }

  function dispatchProductImage(file) {
    return dispatchFileTo("productImgInput", file).then(function () {
      // handleProductImg() reads the file via FileReader, then (async, via
      // the shim) "uploads" it and swaps the <img> src a second time —
      // from the FileReader's data: URL to the shim's blob: URL. Waiting
      // for just "any src" can catch either one depending on real-world
      // timing, and since each rendered frame replays this from scratch,
      // two nearby frames landing on different src values (same picture,
      // different element/paint) reads as a flicker/shake in the final
      // video. Wait specifically for the blob: swap, so every frame
      // settles on the exact same final state.
      return waitUntil(function () {
        var img = document.querySelector("#modalImgsGrid img");
        var src = img && img.getAttribute("src");
        return !!(src && src.indexOf("blob:") === 0);
      });
    });
  }

  function dispatchLogoImage(file) {
    return dispatchFileTo("logoInput", file).then(function () {
      // Same two-stage src swap (preview data: URL, then the shim's
      // blob: URL) as the product image above — wait for the final one.
      return waitUntil(function () {
        var img = document.getElementById("logoImgEl");
        var src = img && img.getAttribute("src");
        return !!(src && src.indexOf("blob:") === 0);
      });
    });
  }

  function dispatchPortadaImage(file) {
    return dispatchFileTo("portadaImgInput", file).then(function () {
      return waitUntil(function () {
        return !!document.querySelector("#portadasSection .portada-slide img");
      }, 4000); // compressImage() draws through a canvas — give it more room
    });
  }

  // The banner shown just before the footer ("portada inferior" — a
  // single image, no carousel, separate real feature from the portadas
  // above it). Same real upload input (#promoBannerInput ->
  // handlePromoBannerUpload) and the same compressImage()-through-a-canvas
  // wait as the portada upload above.
  function dispatchPromoBannerImage(file) {
    return dispatchFileTo("promoBannerInput", file).then(function () {
      return waitUntil(function () {
        return !!document.querySelector("#promoBannerSection .promo-banner-editor-preview img");
      }, 4000);
    });
  }

  // Measured directly (not a guess): in this project's headless Chromium
  // build, dispatching a real <input type="file"> change event whose
  // .files came from a synthetic DataTransfer — which is the only way to
  // trigger the real upload handlers without an OS file picker — costs
  // ~1.9s of real wall-clock time before the app's own async chain
  // (FileReader -> shim "upload" -> swapped <img src>) actually settles,
  // and gets slower/unreliable on repeated dispatches to the same input
  // within one page session. Since every replay() call re-dispatches from
  // scratch, that ~1.9s (or worse) tax hit on every single rendered
  // frame — and its real-world timing varied enough between frames to
  // occasionally land differently, reading as a flicker/glitch in the
  // final video (reported around the product-loading beat). None of that
  // is inherent to the video's content or timing; it's purely a cost of
  // repeating the real dispatch. So each of the four real upload flows
  // below (logo, portada, promo banner, product photo) genuinely
  // dispatches through the real app exactly once per browser session —
  // still 100% real, real functions, a real event, real handlers — and
  // every later replay() call just re-applies that one real, already-
  // observed result directly (through the same real render functions the
  // app itself would call, not invented ones), instead of re-triggering
  // the slow dispatch. This is safe for out-of-order frame requests: the
  // first frame that reaches a given cue (whichever one Remotion happens
  // to request first) pays the one-time dispatch cost and caches the
  // result; every other frame, before or after it in request order,
  // either shows resetToEmpty()'s cleared state (if before the cue) or
  // the one real cached result (if at/after it) — never anything
  // in-between.
  var logoFinalSrc = null;
  function applyLogoLoaded(src) {
    var logoImgEl = document.getElementById("logoImgEl");
    if (logoImgEl) {
      logoImgEl.src = src;
      logoImgEl.dataset.saved = "true";
    }
    var logoImg = document.getElementById("logoImg");
    if (logoImg) logoImg.style.display = "flex";
    var logoPlaceholder = document.getElementById("logoPlaceholder");
    if (logoPlaceholder) logoPlaceholder.style.display = "none";
    var logoDeleteBtn = document.getElementById("logoDeleteBtn");
    if (logoDeleteBtn) logoDeleteBtn.style.display = "flex";
  }
  function ensureLogoDispatched(file) {
    if (logoFinalSrc !== null) {
      applyLogoLoaded(logoFinalSrc);
      return Promise.resolve();
    }
    return dispatchLogoImage(file).then(function () {
      var logoImgEl = document.getElementById("logoImgEl");
      logoFinalSrc = (logoImgEl && logoImgEl.getAttribute("src")) || "";
    });
  }

  var portadaFinalUrl = null;
  function ensurePortadaDispatched(file) {
    if (portadaFinalUrl !== null) {
      if (typeof portadas !== "undefined" && Array.isArray(portadas)) {
        portadas.splice(0, portadas.length, portadaFinalUrl);
      }
      if (typeof renderPortadas === "function") renderPortadas();
      return Promise.resolve();
    }
    return dispatchPortadaImage(file).then(function () {
      var img = document.querySelector("#portadasSection .portada-slide img");
      portadaFinalUrl = (img && img.getAttribute("src")) || "";
    });
  }

  var promoBannerFinalUrl = null;
  function ensurePromoBannerDispatched(file) {
    if (promoBannerFinalUrl !== null) {
      if (typeof dst !== "undefined") dst.pb = promoBannerFinalUrl;
      if (typeof renderPromoBannerEditor === "function") renderPromoBannerEditor();
      return Promise.resolve();
    }
    return dispatchPromoBannerImage(file).then(function () {
      promoBannerFinalUrl = typeof dst !== "undefined" ? dst.pb : null;
    });
  }

  var productImageFinalSrc = null;
  function ensureProductImageDispatched(file) {
    if (productImageFinalSrc !== null) {
      if (typeof currentImgsData !== "undefined" && Array.isArray(currentImgsData)) {
        currentImgsData.splice(0, currentImgsData.length, productImageFinalSrc);
      }
      if (typeof renderModalImgs === "function") renderModalImgs();
      return Promise.resolve();
    }
    return dispatchProductImage(file).then(function () {
      var img = document.querySelector("#modalImgsGrid img");
      productImageFinalSrc = (img && img.getAttribute("src")) || "";
    });
  }

  // The real .modal has a real CSS entrance animation (slideUp 0.3s) that
  // retriggers every time it goes display:none -> flex. resetToEmpty()
  // below closes (hides) both modals at the top of every single replay()
  // call before reopening whichever one applies — so without this, every
  // rendered frame recaptures the modal at whatever random point of that
  // 0.3s happens to line up with real render timing, which looks like the
  // modal trembling/jumping between nearby frames in the final video. This
  // only touches the scripted demo, not how the modal behaves for a real
  // user opening it once.
  function killModalAnimation(overlayId) {
    var overlay = document.getElementById(overlayId);
    var inner = overlay && overlay.querySelector(".modal");
    if (inner) inner.style.animation = "none";
  }

  // Video-only presentational tweak: the "Agregar Producto" modal reads a
  // touch large inside the phone mockup, so it's scaled down uniformly
  // (both axes together, from its own center — the overlay already keeps
  // it centered) — nothing inside it is stretched or squashed, only
  // smaller. Purely a rendering-time transform on the real markup/CSS;
  // doesn't change the modal's real size for an actual user.
  var PRODUCT_MODAL_SCALE = 0.93;
  function scaleProductModal() {
    var inner = document.querySelector("#productModal .modal");
    if (inner) inner.style.transform = "scale(" + PRODUCT_MODAL_SCALE + ")";
  }

  // Same problem, different CSS mechanism: #dPanel (the color-customizer
  // sheet) slides in via `transition: transform 0.3s` on a class toggle
  // instead of a keyframe `animation` on a display toggle — but the effect
  // on a from-scratch-every-frame replay is identical, so it needs the
  // same neutralize-right-after-opening treatment.
  function killTransition(elementId) {
    var el = document.getElementById(elementId);
    if (el) el.style.transition = "none";
  }

  function hexToRgbArr(hex) {
    var h = String(hex).replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  function hexLerp(a, b, t) {
    var ca = hexToRgbArr(a);
    var cb = hexToRgbArr(b);
    return (
      "#" +
      [0, 1, 2]
        .map(function (i) {
          var v = Math.round(ca[i] + (cb[i] - ca[i]) * t);
          return Math.max(0, Math.min(255, v))
            .toString(16)
            .padStart(2, "0");
        })
        .join("")
    );
  }

  // Real presets to cycle through (indices into the source app's own
  // COLOR_PRESETS): Verde (the app's own default) -> Rojo -> Azul ->
  // Violeta.
  var COLOR_CYCLE = [0, 2, 4, 3];

  // Applies one preset's fields to dst with no interpolation (t is always
  // 0 when from === to) — used while the panel is open/hidden, where the
  // exact value isn't visible yet anyway.
  function setDstFromPreset(preset) {
    dstLerp(preset, preset, 0);
  }

  function dstLerp(fromPreset, toPreset, t) {
    ["hc", "ht", "cb", "ct", "ab", "at", "cc", "ctc", "ac"].forEach(function (k) {
      dst[k] = hexLerp(fromPreset[k], toPreset[k], t);
    });
    dst.htAuto = false;
    dst.grad = true;
    dst.ccAuto = false;
  }

  // Real preset switches (applyColorPreset) are an instant snap in the
  // source app — there's no CSS transition on the colored elements
  // themselves. So "not abrupt, well timed" comes from us choosing smooth
  // intermediate values, the same way typedSlice() feeds partial strings
  // into real input fields instead of waiting for a real transition that
  // doesn't exist. This still only ever drives the app's own real `dst`
  // state and its own real dApplyColors()/dGetHBg() — never anything
  // invented. `elapsed` is frames since the panel closed and the real
  // header/footer became visible again (not since it opened) — the whole
  // point is that this plays out live on the page itself, not hidden
  // behind the ~88vh customizer sheet.
  function driveColorCycle(elapsed, cues) {
    if (typeof dst === "undefined" || typeof COLOR_PRESETS === "undefined") return;
    var fromPreset;
    var toPreset;
    var t;
    if (elapsed < cues.colorsHoldFirst) {
      fromPreset = toPreset = COLOR_PRESETS[COLOR_CYCLE[0]];
      t = 0;
    } else {
      var afterFirst = elapsed - cues.colorsHoldFirst;
      var stepIndex = Math.min(COLOR_CYCLE.length - 1, 1 + Math.floor(afterFirst / cues.colorsStepFrames));
      var withinStep = afterFirst - (stepIndex - 1) * cues.colorsStepFrames;
      fromPreset = COLOR_PRESETS[COLOR_CYCLE[stepIndex - 1]];
      toPreset = COLOR_PRESETS[COLOR_CYCLE[stepIndex]];
      t = clamp01(withinStep / cues.colorsTransitionFrames);
    }
    dstLerp(fromPreset, toPreset, t);
    if (typeof dApplyColors === "function") dApplyColors();
  }

  // The app's own real defaults (from `let dst = {...}` in the source),
  // so frames before colorsOpen always show the untouched default look
  // regardless of what order Remotion requests frames in.
  function resetColors() {
    if (typeof dst === "undefined") return;
    dst.hc = "#128C7E";
    dst.ht = "#ffffff";
    dst.htAuto = true;
    dst.cb = "#ffffff";
    dst.ct = "#128C7E";
    dst.grad = true;
    dst.ab = "#ffffff";
    dst.at = "#128C7E";
    dst.cc = "#25D366";
    dst.ctc = "#ffffff";
    dst.ac = "#128C7E";
    dst.ccAuto = true;
    if (typeof dApplyColors === "function") dApplyColors();
    if (typeof dClose === "function") dClose();
  }

  // dst.pb (the promo banner / "portada inferior") is loaded straight
  // from the shim's customcolors on page load, same as
  // businessInstagram/etc. above — so it needs the same reset-to-empty
  // treatment for the demo to show it going from nothing to added.
  function resetPromoBanner() {
    if (typeof dst === "undefined") return;
    dst.pb = null;
    if (typeof renderPromoBannerEditor === "function") renderPromoBannerEditor();
  }

  function waitUntil(predicate, timeoutMs) {
    var start = Date.now();
    var limit = timeoutMs || 2000;
    return new Promise(function (resolve) {
      (function poll() {
        if (predicate() || Date.now() - start > limit) {
          resolve();
          return;
        }
        setTimeout(poll, 16);
      })();
    });
  }

  function resetToEmpty() {
    if (typeof closeProductModal === "function") closeProductModal();
    if (typeof closeBusinessModal === "function") closeBusinessModal();
    products.length = 0;
    if (typeof renderProducts === "function") renderProducts();
    if (typeof renderCategories === "function") renderCategories();

    // The business-setup beats (logo/descripción/portada) replay from an
    // empty state too, same reasoning as products above.
    var logoImgEl = document.getElementById("logoImgEl");
    if (logoImgEl) {
      logoImgEl.src = "";
      logoImgEl.dataset.saved = "";
    }
    var logoImg = document.getElementById("logoImg");
    if (logoImg) logoImg.style.display = "none";
    var logoDeleteBtn = document.getElementById("logoDeleteBtn");
    if (logoDeleteBtn) logoDeleteBtn.style.display = "none";
    var logoPlaceholder = document.getElementById("logoPlaceholder");
    if (logoPlaceholder) logoPlaceholder.style.display = "flex";

    var taglineEl = document.getElementById("businessTagline");
    if (taglineEl) taglineEl.textContent = "";
    var footerTaglineEl = document.getElementById("footerTagline");
    if (footerTaglineEl) footerTaglineEl.textContent = "";

    // The shim's catalog row now carries the real instagram/facebook/
    // tiktok values (so the real catalog page can show them), which means
    // the editor's own load path pre-fills businessInstagram/etc. from it
    // immediately — same reset-from-empty treatment as the tagline above,
    // so the demo still shows them going from nothing to added.
    if (typeof businessInstagram !== "undefined") businessInstagram = "";
    if (typeof businessFacebook !== "undefined") businessFacebook = "";
    if (typeof businessTiktok !== "undefined") businessTiktok = "";
    if (typeof updateFooterExtras === "function") updateFooterExtras();

    if (typeof portadas !== "undefined" && Array.isArray(portadas)) portadas.length = 0;
    if (typeof renderPortadas === "function") renderPortadas();

    resetColors();
    resetPromoBanner();
  }

  // The real toast/save-indicator are timer-driven (CSS class + setTimeout
  // auto-hide). Since Remotion re-runs replay() on every rendered video
  // frame, calling the real functions unconditionally would re-trigger
  // those timers dozens of times a second — the toast never gets to finish
  // its own animation, so it looks like flickering/broken UI in the final
  // video. Silencing them here only affects this scripted demo; it doesn't
  // touch how toasts behave for a real user.
  if (typeof showToast === "function") {
    showToast = function () {};
  }
  if (typeof debouncedSave === "function") {
    debouncedSave = function () {};
  }

  var demoImageFile = null;
  var demoLogoFile = null;
  var demoPortadaFile = null;
  var demoPortadaUrl = null;
  var demoPromoBannerFile = null;

  // Order: logo → descripción del negocio → portada (superior) → banner
  // antes del footer (inferior) → (foto → nombre → precio → descripción →
  // categoría → guardar de UN producto) → resto de productos ya cargados →
  // personalizar colores (encabezado + footer, ciclando por presets
  // reales). Every step uses the editor's own real functions — nothing
  // here recreates or fakes its UI.
  async function replay(frame, cues, businessData) {
    // The supabase shim hands back businessData.portadas as the exact
    // same array object the editor's own `portadas` variable then points
    // at (unlike products, which the editor copies via .filter() on
    // load) — so resetToEmpty()'s `portadas.length = 0` below would also
    // silently empty businessData.portadas on every call after the
    // first. Snapshot the URL string once, before that can ever happen.
    if (demoPortadaUrl === null) demoPortadaUrl = businessData.portadas[0];

    resetToEmpty();

    if (frame >= cues.logoUpload) {
      if (!demoLogoFile) {
        demoLogoFile = await urlToFile(businessData.logo, "logo.jpg");
      }
      await ensureLogoDispatched(demoLogoFile);
    }

    if (frame >= cues.descOpen) {
      if (typeof editBusiness === "function") editBusiness();
      killModalAnimation("businessModal");
      var descProgress = clamp01((frame - cues.descOpen) / (cues.descTyped - cues.descOpen));
      setValue("inputTagline", typedSlice(businessData.tagline, descProgress));
    }

    if (frame >= cues.descTyped) {
      if (businessData.instagram) setValue("inputInstagram", businessData.instagram);
      if (businessData.facebook) setValue("inputFacebook", businessData.facebook);
      if (businessData.tiktok) setValue("inputTiktok", businessData.tiktok);
    }

    if (frame >= cues.descSaved) {
      if (typeof saveBusinessInfo === "function") saveBusinessInfo();
    }

    if (frame >= cues.portadaUpload) {
      if (!demoPortadaFile) {
        demoPortadaFile = await urlToFile(demoPortadaUrl, "portada.jpg");
      }
      await ensurePortadaDispatched(demoPortadaFile);
    }

    if (frame >= cues.promoBannerUpload) {
      if (!demoPromoBannerFile) {
        demoPromoBannerFile = await urlToFile(businessData.promoBanner, "banner.jpg");
      }
      await ensurePromoBannerDispatched(demoPromoBannerFile);
    }

    if (frame < cues.openModal) return;
    if (typeof openAddModal === "function") openAddModal();
    killModalAnimation("productModal");
    scaleProductModal();

    if (frame >= cues.pickImage) {
      if (!demoImageFile) {
        demoImageFile = await urlToFile(businessData.demoProduct.img, "producto.jpg");
      }
      await ensureProductImageDispatched(demoImageFile);
    }

    // Each field gets its own explicit start cue (not just "right after the
    // previous field finished") so there's a genuine still beat between
    // them — a real pause where nothing is changing — rather than one
    // field's typing running straight into the next.
    if (frame >= cues.nameStart) {
      var nameProgress = clamp01((frame - cues.nameStart) / (cues.nameDone - cues.nameStart));
      setValue("inputName", typedSlice(businessData.demoProduct.name, nameProgress));
    }

    if (frame >= cues.priceStart) {
      var priceProgress = clamp01((frame - cues.priceStart) / (cues.priceDone - cues.priceStart));
      setValue("inputPrice", typedSlice(businessData.demoProduct.price || "", priceProgress));
    }

    if (frame >= cues.descStart) {
      var productDescProgress = clamp01((frame - cues.descStart) / (cues.descDone - cues.descStart));
      setValue("inputDesc", typedSlice(businessData.demoProduct.desc || "", productDescProgress));
    }

    if (frame >= cues.category) {
      setValue("inputCat", businessData.demoProduct.category);
    }

    if (frame >= cues.saved) {
      if (typeof saveProduct === "function") saveProduct();
    }

    if (frame >= cues.bulkLoad) {
      var already = products.map(function (p) {
        return p.name;
      });
      businessData.products.forEach(function (p) {
        if (already.indexOf(p.name) === -1) {
          products.push(Object.assign({}, p));
        }
      });
      if (typeof renderProducts === "function") renderProducts();
      if (typeof renderCategories === "function") renderCategories();
    }

    // First: briefly show the real panel itself opening, so it reads as
    // "here's the real color customizer" — then close it again. The
    // preset cycle that follows plays out on the actual page with the
    // panel/overlay fully gone, so the header + footer color change is
    // the thing on screen, not just the settings sheet sitting open.
    if (frame >= cues.colorsOpen && frame < cues.colorsPanelClose) {
      if (typeof dOpen === "function") dOpen();
      killTransition("dPanel");
      killTransition("dOverlay");
      setDstFromPreset(COLOR_PRESETS[COLOR_CYCLE[0]]);
      if (typeof dApplyColors === "function") dApplyColors();
    } else if (frame >= cues.colorsPanelClose) {
      if (typeof dClose === "function") dClose();
      killTransition("dPanel");
      killTransition("dOverlay");
      driveColorCycle(frame - cues.colorsPanelClose, cues);
    }
  }

  function clamp01(n) {
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(1, n));
  }

  return { replay: replay };
})();
