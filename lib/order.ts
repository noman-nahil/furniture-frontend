/**
 * Place order: POST to backend or store locally (for demo).
 */

import { getClientApiBaseUrl, joinApiUrl } from "@/lib/apiUrl";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
import type { CartItem } from "./cart";
import type { ValidatedCartItem } from "@/features/cart/types";
import type { LocalizedField } from "@/types/product";

export type DeliveryAddress = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  area?: string;
};

export type OrderPayload = {
  items: ValidatedCartItem[];
  subtotal: number;
  deliveryAddress: DeliveryAddress;
  deliveryType: "cash_on_delivery";
  guestName?: string;
  guestPhone?: string;
  idempotencyKey?: string;
};

function getBaseUrl(): string {
  if (typeof window === "undefined") return "";
  return getClientApiBaseUrl();
}

function parseApiMessage(data: unknown, fallback: string): string {
  const p = data as { error?: unknown; message?: unknown } | null;
  if (p && typeof p.error === "string" && p.error.trim()) return p.error.trim();
  if (p && typeof p.message === "string" && p.message.trim()) {
    return p.message.trim();
  }
  return fallback;
}

export async function placeOrder(payload: OrderPayload): Promise<{
  success: boolean;
  message?: string;
  trackingToken?: string;
}> {
  const base = getBaseUrl();
  if (base) {
    try {
      const res = await authenticatedFetch(joinApiUrl(base, "/orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return {
          success: true,
          trackingToken: data.trackingToken as string | undefined,
          message: data.message as string | undefined,
        };
      }
      return {
        success: false,
        message: parseApiMessage(data, "Failed to place order."),
      };
    } catch {
      return { success: false, message: "Network error." };
    }
  }
  const ordersKey = "ministore-orders";
  const orders: unknown[] = JSON.parse(
    localStorage.getItem(ordersKey) || "[]",
  );
  const trackingToken = `demo-${Date.now()}`;
  orders.push({ trackingToken, ...payload, placedAt: new Date().toISOString() });
  localStorage.setItem(ordersKey, JSON.stringify(orders));
  return { success: true, trackingToken };
}

export type OrderTracking = {
  status: string;
  createdAt: string;
  items: {
    productId: string;
    name: LocalizedField;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  deliveryCity?: string;
  deliveryArea?: string;
  deliveryType?: string;
};

export function formatTrackingReference(trackingToken: string): string {
  return trackingToken.slice(0, 8).toUpperCase();
}

export async function fetchOrderTracking(trackingToken: string): Promise<{
  success: boolean;
  order?: OrderTracking;
  message?: string;
}> {
  const base = getBaseUrl();
  if (!base) {
    return { success: false, message: "API not configured." };
  }
  try {
    const res = await fetch(
      joinApiUrl(base, `/orders/track/${encodeURIComponent(trackingToken)}`),
      { credentials: "include" },
    );
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return { success: true, order: data as OrderTracking };
    }
    return {
      success: false,
      message: parseApiMessage(data, "Order not found."),
    };
  } catch {
    return { success: false, message: "Network error." };
  }
}
