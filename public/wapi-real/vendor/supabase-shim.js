/**
 * Local stand-in for @supabase/supabase-js, used only so the REAL Wapi
 * editor/catalog code (unmodified) can run against a fixed local business
 * record instead of the live production database. Implements just the
 * surface these two pages actually call: .from().select().eq().single()/
 * .maybeSingle(), .auth.getSession()/.signOut(), .storage.from().upload()/
 * .getPublicUrl()/.remove().
 */
(function () {
  var DATA = window.__WAPI_BUSINESS_DATA__ || null;
  var uploadedUrls = {};

  function resolved(value) {
    return Promise.resolve(value);
  }

  function catalogRow() {
    if (!DATA) return null;
    return {
      id: "demo-" + DATA.slug,
      slug: DATA.slug,
      business_name: DATA.business_name,
      tagline: DATA.tagline,
      wa_number: DATA.wa_number,
      logo: DATA.logo,
      address: "",
      instagram: DATA.instagram || "",
      facebook: DATA.facebook || "",
      tiktok: DATA.tiktok || "",
      products: DATA.products,
      categories: DATA.categories,
      min_rows: 4,
      published: true,
      user_id: "demo-user",
      portadas: DATA.portadas,
      ann_bar_text: "",
      ann_bar_active: false,
      msg_float: "",
      msg_product: "",
      msg_cart: "",
      beneficios: [],
      horarios: DATA.horarios || [],
      // headerColor deliberately omitted — applyCatalogColors() bails out
      // right after reading it if it's missing, leaving Wapi's own default
      // theme untouched. Only promoBanner is real customization here.
      customcolors: DATA.promoBanner ? { promoBanner: DATA.promoBanner } : null,
      plan: "lifetime",
      status: "active",
      expires_at: null,
    };
  }

  function makeQueryBuilder(table) {
    var builder = {
      select: function () {
        return builder;
      },
      eq: function () {
        return builder;
      },
      order: function () {
        return builder;
      },
      limit: function () {
        return builder;
      },
      neq: function () {
        return builder;
      },
      single: function () {
        if (table === "catalogs") return resolved({ data: catalogRow(), error: null });
        return resolved({ data: null, error: null });
      },
      maybeSingle: function () {
        if (table === "catalogs") return resolved({ data: catalogRow(), error: null });
        // e.g. admin_users lookup — nobody is an admin in this demo.
        return resolved({ data: null, error: null });
      },
      insert: function () {
        return builder;
      },
      update: function () {
        return builder;
      },
      upsert: function () {
        return builder;
      },
      delete: function () {
        return builder;
      },
      then: function (onFulfilled, onRejected) {
        return resolved({ data: table === "catalogs" ? [catalogRow()] : [], error: null }).then(
          onFulfilled,
          onRejected,
        );
      },
    };
    return builder;
  }

  function fileToObjectUrl(file) {
    try {
      return URL.createObjectURL(file);
    } catch (e) {
      return "";
    }
  }

  window.supabase = {
    createClient: function () {
      return {
        from: function (table) {
          return makeQueryBuilder(table);
        },
        auth: {
          getSession: function () {
            return resolved({ data: { session: { user: { id: "demo-user" } } }, error: null });
          },
          signOut: function () {
            return resolved({ error: null });
          },
        },
        storage: {
          from: function () {
            return {
              upload: function (path, file) {
                uploadedUrls[path] = file ? fileToObjectUrl(file) : "";
                return resolved({ data: { path: path }, error: null });
              },
              getPublicUrl: function (path) {
                return { data: { publicUrl: uploadedUrls[path] || "" } };
              },
              remove: function () {
                return resolved({ data: null, error: null });
              },
            };
          },
        },
      };
    },
  };
})();
