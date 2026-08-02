// lib/locale.ts
import type { LocalizedField } from "@/types/product";

const DEFAULT_LOCALE: "fr" | "en" = "fr";

/**
 * Resolves a possibly-localized field to a display string.
 * Single source of truth — was previously redefined locally in at least
 * CheckoutFlow.tsx (and per its own comment, possibly ProductCard/PDP too).
 * Import this instead of redeclaring it per-component.
 */
export function pickLocale(
  field: LocalizedField | string | undefined,
  locale: "fr" | "en" = DEFAULT_LOCALE
): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[locale] || field.fr || "";
}