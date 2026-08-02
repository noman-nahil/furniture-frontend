
export type LocalizedField = {
  fr: string;
  en?: string;
};

/** Store-facing product fields shared across catalog, PDP, and cart context. */
export type StoreProduct = {
  _id: string;

  name: LocalizedField;
  slug: LocalizedField;
  price: number;
  quantity?: number;
  images?: string[];
  discount?: number;
  discountPrice?: number;
  finalPrice?: number;
  discountStartsAt?: string;
  discountEndsAt?: string;
  status?: string;
  createdAt?: string;
};