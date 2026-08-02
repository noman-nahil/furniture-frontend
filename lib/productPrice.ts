import { formatCurrency } from "./formatCurrency";

export type PricedProduct = {
  price: number;
  discount?: number;
  discountPrice?: number;
  finalPrice?: number;
  discountStartsAt?: string | Date;
  discountEndsAt?: string | Date;
};

const MS_DAY = 86400000;
export const NEW_PRODUCT_DAYS = 14;
export const LOW_STOCK_THRESHOLD = 5;

export function isDiscountScheduleActive(p: PricedProduct): boolean {
  const now = Date.now();
  if (p.discountStartsAt && new Date(p.discountStartsAt).getTime() > now) {
    return false;
  }
  if (p.discountEndsAt && new Date(p.discountEndsAt).getTime() < now) {
    return false;
  }
  return true;
}

/** Same rules as backend virtual: schedule → discountPrice → percent → list price. */
export function getFinalPrice(p: PricedProduct): number {
  if (!isDiscountScheduleActive(p)) {
    return p.price;
  }
  if (p.discountPrice != null && p.discountPrice > 0) {
    return p.discountPrice;
  }
  if ((p.discount ?? 0) > 0) {
    return Math.round(p.price - (p.price * (p.discount ?? 0)) / 100);
  }
  return p.price;
}

export function hasProductDiscount(p: PricedProduct): boolean {
  if (!isDiscountScheduleActive(p)) return false;
  return (
    (p.discount ?? 0) > 0 || (p.discountPrice != null && p.discountPrice > 0)
  );
}

export function discountBadgeLabel(p: PricedProduct): string {
  if (!hasProductDiscount(p)) return "";
  if ((p.discount ?? 0) > 0 && !(p.discountPrice != null && p.discountPrice > 0)) {
    return `${p.discount}% OFF`;
  }
  return "Sale";
}

/**
 * @deprecated Use formatCurrency from @/lib/formatCurrency instead
 * Kept for backward compatibility
 */
export function formatBDT(amount: number): string {
  return formatCurrency(amount);
}

export function isProductNew(createdAt?: string): boolean {
  if (!createdAt) return false;
  const t = new Date(createdAt).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < NEW_PRODUCT_DAYS * MS_DAY;
}

export function isOutOfStock(quantity?: number): boolean {
  return quantity !== undefined && quantity <= 0;
}

export function isLowStock(quantity?: number): boolean {
  return (
    quantity !== undefined &&
    quantity > 0 &&
    quantity <= LOW_STOCK_THRESHOLD
  );
}
