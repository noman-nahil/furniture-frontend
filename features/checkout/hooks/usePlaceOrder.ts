// features/checkout/hooks/usePlaceOrder.ts
"use client";

import { useState } from "react";
import { getMetaCapiContext } from "@/lib/analytics/metaBrowser";
import { trackPurchase } from "@/lib/analytics/events";
import { setCart } from "@/lib/cart";
import { pickLocale } from "@/lib/locale";
import { checkoutApi, type DeliveryAddress } from "../api/checkoutApi";
import type { ValidatedCartItem } from "@/features/cart/types";

function generateIdempotencyKey(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function usePlaceOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  // Generated once per mount, not per submit — resubmitting after a
  // failure reuses the same key so a duplicate order isn't created if
  // the first attempt actually succeeded server-side but the response
  // was lost (e.g. network drop right after the write).
  const [idempotencyKey] = useState(generateIdempotencyKey);

  async function submit(
    deliveryAddress: DeliveryAddress,
    validatedItems: ValidatedCartItem[],
    subtotal: number
  ): Promise<boolean> {
    setError("");
    setLoading(true);

    const meta = getMetaCapiContext();
    const result = await checkoutApi.placeOrder({
      items: validatedItems,
      subtotal,
      deliveryAddress,
      deliveryType: "cash_on_delivery",
      idempotencyKey,
      meta: meta ?? undefined,
    });

    setLoading(false);

    if (result.success) {
      setCart([]);
      window.dispatchEvent(new CustomEvent("cart-update"));
      setTrackingToken(result.trackingToken || null);
      if (result.trackingToken) {
        trackPurchase({
          transactionId: result.trackingToken,
          value: subtotal,
          eventId: meta?.event_id,
          items: validatedItems.map((item) => ({
            itemId: item.productId,
            contentId: item.slug?.fr,
            itemName: pickLocale(item.name),
            price: item.price,
            quantity: item.quantity,
          })),
        });
      }
      return true;
    }

    setError(result.message || "Failed to place order.");
    return false;
  }

  return { loading, error, trackingToken, submit };
}