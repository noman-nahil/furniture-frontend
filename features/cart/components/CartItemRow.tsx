// features/cart/components/CartItemRow.tsx
"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatBDT } from "@/lib/productPrice";
import { getImageUrl } from "@/lib/image";
import type { ValidatedCartItem } from "../types";
import type { LocalizedField } from "@/types/product";

type CartItemRowProps = {
  item: ValidatedCartItem;
  disabled: boolean;
  onQuantityChange: (productId: string, newQty: number) => void;
  onRemove: (productId: string) => void;
};

// NEW: same locale-resolution helper used in ProductCard/PDP — falls
// back to French (always populated) if the requested locale is missing,
// and to an empty string if the field is a plain string already (covers
// any cart items that may have been cached/serialized before the i18n
// migration, so an old cart doesn't crash on this line either).
function pickLocale(field: LocalizedField | string | undefined, locale: "fr" | "en" = "fr"): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[locale] || field.fr || "";
}

function CartItemRowComponent({ item, disabled, onQuantityChange, onRemove }: CartItemRowProps) {
  // CHANGED: item.slug/item.name are now locale objects — resolve to a
  // plain string before building the href or rendering as text.
  const slugValue = pickLocale(item.slug as unknown as LocalizedField | string);
  const displayName = pickLocale(item.name as unknown as LocalizedField | string);

  const href = slugValue ? `/products/${slugValue}` : "/products";

  return (
    <li className="p-4 sm:p-5 hover:bg-gray-50/50 transition-colors">
      <div className="flex gap-4">
        <Link
          href={href}
          className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-100 overflow-hidden ring-1 ring-gray-200/80"
        >
          <Image
            src={item.image ? getImageUrl(item.image) : "/placeholder-product.png"}
            alt={displayName}
            fill
            sizes="96px"
            quality={90}
            className="object-cover"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={href} className="font-medium text-gray-900 hover:text-gray-700 line-clamp-2 text-[15px]">
            {displayName}
          </Link>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-0.5">
            <span className="text-sm text-gray-500 tabular-nums">
              {formatBDT(item.price)} × {item.quantity}
            </span>
          </div>
          <p className="text-base font-semibold text-gray-900 mt-2 tabular-nums">{formatBDT(item.lineTotal)}</p>
        </div>

        <div className="flex flex-col items-end justify-between gap-2">
          <div className="flex items-center rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => onQuantityChange(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1 || disabled}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-l-md transition-colors"
              aria-label="Decrease quantity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="w-8 text-center text-sm font-medium text-gray-900 tabular-nums">{item.quantity}</span>
            <button
              type="button"
              onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
              disabled={item.quantity >= item.stock || disabled}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-r-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            disabled={disabled}
            className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-40"
            aria-label="Remove from cart"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}

// Memoized so updating one line item's quantity doesn't re-render every
// other row in the list.
export const CartItemRow = memo(CartItemRowComponent);