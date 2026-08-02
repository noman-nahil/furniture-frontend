// features/checkout/hooks/useCheckoutValidation.ts
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCartValidation } from "@/features/cart/hooks/useCartValidation";
import { STOCK_ADJUSTMENT_REDIRECT_DELAY_MS } from "../constants";

/**
 * Reuses the exact same cart-validation hook the cart page uses — this
 * used to be a ~90-line independent copy of that logic living inline in
 * CheckoutFlow.tsx (including its own copy of the toast.warning bug).
 * The only checkout-specific behavior is redirecting back to /cart when
 * stock gets adjusted mid-checkout, which useCartValidation now supports
 * via an onStockAdjusted callback rather than needing its own fork.
 */
export function useCheckoutValidation() {
  const router = useRouter();
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validation = useCartValidation({
    onStockAdjusted: () => {
      redirectTimerRef.current = setTimeout(() => {
        router.replace("/cart");
      }, STOCK_ADJUSTMENT_REDIRECT_DELAY_MS);
    },
  });

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  return validation;
}