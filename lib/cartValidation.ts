
export type ValidatedCartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  slug?: string;
  image?: string;
  lineTotal: number;
  stock: number;
};

export type CheckoutResponse = {
  items: ValidatedCartItem[];
  total: number;
  stockAdjustments?: {
    productId: string;
    name: string;
    requested: number;
    available: number;
  }[];
};

export const CART_CACHE_KEY = "cart_validation_cache";
export const CART_CACHE_TTL_MS = 30 * 1000;

