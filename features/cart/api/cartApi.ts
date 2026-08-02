// features/cart/api/cartApi.ts
import { apiFetch } from "@/lib/authClient";
import type { CartItem } from "@/lib/cart";
import type { CheckoutValidationResponse } from "../types";

export const cartApi = {
  validate: async (items: CartItem[], signal?: AbortSignal): Promise<CheckoutValidationResponse> => {
    return apiFetch<CheckoutValidationResponse>("/orders/checkout", {
      method: "POST",
      body: JSON.stringify({ items }),
      signal,
    });
  },
};
