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
  portadas: string[];
  categories: string[];
  /** Product used for the scripted "add one product" editor demo. */
  demoProduct: Product;
  products: Product[];
};
