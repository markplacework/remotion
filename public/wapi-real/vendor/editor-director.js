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

    if (typeof portadas !== "undefined" && Array.isArray(portadas)) portadas.length = 0;
    if (typeof renderPortadas === "function") renderPortadas();
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

  // Order: logo → descripción del negocio → portada → (foto → nombre →
  // precio → descripción → categoría → guardar de UN producto) → resto de
  // productos ya cargados. Every step uses the editor's own real
  // functions — nothing here recreates or fakes its UI.
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
      await dispatchLogoImage(demoLogoFile);
    }

    if (frame >= cues.descOpen) {
      if (typeof editBusiness === "function") editBusiness();
      killModalAnimation("businessModal");
      var descProgress = clamp01((frame - cues.descOpen) / (cues.descTyped - cues.descOpen));
      setValue("inputTagline", typedSlice(businessData.tagline, descProgress));
    }

    if (frame >= cues.descSaved) {
      if (typeof saveBusinessInfo === "function") saveBusinessInfo();
    }

    if (frame >= cues.portadaUpload) {
      if (!demoPortadaFile) {
        demoPortadaFile = await urlToFile(demoPortadaUrl, "portada.jpg");
      }
      await dispatchPortadaImage(demoPortadaFile);
    }

    if (frame < cues.openModal) return;
    if (typeof openAddModal === "function") openAddModal();
    killModalAnimation("productModal");

    if (frame >= cues.pickImage) {
      if (!demoImageFile) {
        demoImageFile = await urlToFile(businessData.demoProduct.img, "producto.jpg");
      }
      await dispatchProductImage(demoImageFile);
    }

    if (frame >= cues.pickImage) {
      var nameProgress = clamp01((frame - cues.pickImage) / (cues.nameDone - cues.pickImage));
      setValue("inputName", typedSlice(businessData.demoProduct.name, nameProgress));
    }

    if (frame >= cues.nameDone) {
      var priceProgress = clamp01((frame - cues.nameDone) / (cues.priceDone - cues.nameDone));
      setValue("inputPrice", typedSlice(businessData.demoProduct.price || "", priceProgress || 1));
    }

    if (frame >= cues.priceDone) {
      // The description is much longer than the name — reveal it briskly
      // (it's still visibly "typing", just not at the same reading pace)
      // instead of eating the whole scene on one field.
      var productDescProgress = clamp01((frame - cues.priceDone) / (cues.descDone - cues.priceDone));
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
  }

  function clamp01(n) {
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(1, n));
  }

  return { replay: replay };
})();
