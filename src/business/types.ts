export type Product = {
  id: string;
  name: string;
  price: string;
  desc: string;
  img: string;
  category: string;
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
};
