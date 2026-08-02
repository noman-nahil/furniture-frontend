// features/products/utils/productFilters.ts
import { hasProductDiscount } from "@/lib/productPrice";
import type { Product, Subcategory } from "../types";

/**
 * Returns true if a product's discount is currently active, respecting
 * optional discountStartsAt / discountEndsAt windows.
 */
export function isDiscountActive(product: Product, now: Date = new Date()): boolean {
  if (!hasProductDiscount(product)) return false;

  const startsAt = product.discountStartsAt ? new Date(product.discountStartsAt) : null;
  const endsAt = product.discountEndsAt ? new Date(product.discountEndsAt) : null;

  if (startsAt && now < startsAt) return false;
  if (endsAt && now > endsAt) return false;
  return true;
}

/**
 * Normalizes a subcategory's parent-category reference to a plain id string,
 * regardless of whether the backend sent a populated object or a raw id.
 * NOTE: prefer normalizing this once in productsApi.ts on fetch — this helper
 * exists as a safety net for any subcategory data that slips through un-normalized.
 */
export function subcategoryParentKey(s: Subcategory | { parentCategory?: unknown }): string {
  const raw = (s as { parentCategory?: unknown }).parentCategory ?? (s as Subcategory).parentCategoryId;
  if (raw && typeof raw === "object") {
    const o = raw as { _id?: unknown; id?: unknown };
    return String(o._id ?? o.id ?? "");
  }
  return raw != null ? String(raw) : "";
}

export function categoryNameById(categories: { _id: string; name: string }[], id?: string): string {
  return categories.find((c) => c._id === id)?.name ?? id ?? "-";
}

export function subcategoryNameById(subcategories: Subcategory[], id?: string): string {
  return subcategories.find((s) => s._id === id)?.name ?? id ?? "-";
}