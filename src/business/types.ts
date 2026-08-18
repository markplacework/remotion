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
  /** Wapi's own real carousel/autoplay activates automatically once this
   * has more than one entry — deliberately left untouched (no custom
   * carousel code anywhere in this project); whatever it does natively
   * during a render is what ends up in the video. */
  portadas: string[];
  /** Single banner shown just before the footer — a separate real Wapi
   * feature from the top portadas carousel (customcolors.promoBanner). */
  promoBanner: string;
  categories: string[];
  /** Product used for the scripted "add one product" editor demo. */
  demoProduct: Product;
  products: Product[];
};
