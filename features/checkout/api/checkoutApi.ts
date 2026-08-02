// features/checkout/api/checkoutApi.ts
import { placeOrder, type DeliveryAddress } from "@/lib/order";

/**
 * Thin re-export, not a reimplementation — placeOrder already lives in
 * lib/order.ts (shared with order-tracking). Wrapping it here just gives
 * this feature the same api/ entry point convention as features/products
 * and features/cart, instead of components reaching into lib/ directly.
 */
export const checkoutApi = {
  placeOrder,
};

export type { DeliveryAddress };