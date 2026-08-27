export type Product = {
  id: string;
  name: string;
  price: string;
  desc: string;
  img: string;
  category: string;
};

/** One weekday's opening hours, in the real catalog page's own "days"
 * format (renderHorariosSection in catalogo_v28.html) — from2/to2 is an
 * optional second shift (e.g. lunch + dinner). from/to are only read
 * when open is true. */
export type DayHours = { open: boolean; from?: string; to?: string; from2?: string; to2?: string };

export type Horarios = {
  active: boolean;
  days: Partial<Record<"lunes" | "martes" | "miercoles" | "jueves" | "viernes" | "sabado" | "domingo", DayHours>>;
};

export type BusinessData = {
  slug: string;
  business_name: string;
  tagline: string;
  wa_number: string;
  logo: string;
  /** Kept to a single entry — one portada on top (fixed), separate from
   * the promoBanner below (the "portada inferior"). Wapi's own real
   * carousel/autoplay would activate automatically past one entry, but
   * this project never adds custom carousel code either way. */
  portadas: string[];
  /** Banner shown just before the footer — the "portada inferior",
   * a separate real Wapi feature from the top portadas carousel
   * (customcolors.promoBanner). */
  promoBanner: string;
  /** Optional — same fields as the real editor's "Datos del negocio"
   * modal. Handles only, no leading @ or URL (the real app normalizes
   * them for display/links). */
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  categories: string[];
  /** Product used for the scripted "add one product" editor demo. */
  demoProduct: Product;
  products: Product[];
  /** Optional — populates the real "Horarios" chips in the catalog
   * page's own UBICACION Y HORARIOS section. Omitted entirely means
   * that section stays hidden (supabase-shim.js defaults to []). */
  horarios?: Horarios;
};
