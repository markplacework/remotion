// ── DIRECTOR (inyectado por el proyecto de video) ──
// Reproduce de forma determinística, a partir de CERO en cada llamada, la
// demo de "agregar un producto" usando exclusivamente las funciones reales
// de este editor (openAddModal/saveProduct/etc.), nunca lógica inventada.
// Esto permite que Remotion pida cualquier frame en cualquier orden y el
// resultado visual sea siempre el correcto para ese frame.
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

  function dispatchProductImage(file) {
    var input = document.getElementById("productImgInput");
    if (!input) return Promise.resolve();
    var dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    // handleProductImg() reads the file via FileReader, then (async, via
    // the shim) "uploads" it and re-renders with the final src — poll for
    // that instead of guessing a fixed delay, so this is correct
    // regardless of how fast/slow the render environment is.
    return waitUntil(function () {
      var img = document.querySelector("#modalImgsGrid img");
      return !!(img && img.getAttribute("src"));
    });
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
    products.length = 0;
    if (typeof renderProducts === "function") renderProducts();
    if (typeof renderCategories === "function") renderCategories();
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

  var demoImageDataUrl = null;
  var demoImageFile = null;

  // Follows the modal's real top-to-bottom order: foto → nombre → precio →
  // descripción → categoría → guardar.
  async function replay(frame, cues, businessData) {
    resetToEmpty();

    if (frame < cues.openModal) return;
    if (typeof openAddModal === "function") openAddModal();

    if (frame >= cues.pickImage) {
      if (!demoImageFile) {
        demoImageDataUrl = await fetch(businessData.demoProduct.img)
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
          });
        demoImageFile = await dataUrlToFile(demoImageDataUrl, "producto.jpg");
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
      var descProgress = clamp01((frame - cues.priceDone) / (cues.descDone - cues.priceDone));
      setValue("inputDesc", typedSlice(businessData.demoProduct.desc || "", descProgress));
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
