// features/cart/types.ts

import type { LocalizedField } from "@/types/product";

export type ValidatedCartItem = {
  productId: string;
  // CHANGED: name/slug are now locale objects, matching the backend's
  // product.name/product.slug shape.
  name: LocalizedField;
  price: number;
  quantity: number;
  slug?: LocalizedField;
  image?: string;
  lineTotal: number;
  stock: number;
};

export type StockAdjustment = {
  productId: string;
  // CHANGED: same as above — this is shown to the shopper when quantity
  // gets clamped at checkout ("only 2 left of X"), so it needs the same
  // locale resolution wherever it's rendered.
  name: LocalizedField;
  requested: number;
  available: number;
};

export type CheckoutValidationResponse = {
  items: ValidatedCartItem[];
  total: number;
  stockAdjustments?: StockAdjustment[];
};