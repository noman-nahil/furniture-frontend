// features/cart/hooks/useCartValidation.ts
"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  getCart,
  setCart,
  updateCartItemQuantity,
  removeFromCart,
  type CartItem,
} from "@/lib/cart";
import { pickLocale } from "@/lib/locale";
import { cartApi } from "../api/cartApi";
import type { ValidatedCartItem, StockAdjustment } from "../types";

type UseCartValidationOptions = {
  /**
   * Fired after the stock-adjustment toast, with the raw adjustments —
   * lets a caller layer its own behavior on top (e.g. checkout redirecting
   * back to /cart) without this hook needing to know about routing at all.
   * The cart page itself doesn't pass this; checkout does.
   */
  onStockAdjusted?: (adjustments: StockAdjustment[]) => void;
};

export function useCartValidation(options: UseCartValidationOptions = {}) {
  const { onStockAdjusted } = options;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [validatedItems, setValidatedItems] = useState<ValidatedCartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [revalidating, setRevalidating] = useState(false);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Cancels a stale in-flight request whenever a newer one starts, so a slow
  // response for an earlier click can never overwrite a faster later one.
  const abortRef = useRef<AbortController | null>(null);

  const fetchCartDetails = async (items: CartItem[], isInitialLoad = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (isInitialLoad) {
      setInitialLoading(true);
      setFatalError(null);
    } else {
      setRevalidating(true);
    }

    if (items.length === 0) {
      setValidatedItems([]);
      setTotal(0);
      setFatalError(null);
      setInitialLoading(false);
      setRevalidating(false);
      return;
    }

    try {
      const data = await cartApi.validate(items, controller.signal);
      setValidatedItems(data.items);
      setTotal(data.total);

      if (data.stockAdjustments && data.stockAdjustments.length > 0) {
        const updatedCart = items
          .map((cartItem) => {
            const adjustment = data.stockAdjustments!.find((adj) => adj.productId === cartItem.productId);
            return adjustment ? { ...cartItem, quantity: adjustment.available } : cartItem;
          })
          .filter((item) => item.quantity > 0);

        setCart(updatedCart);
        setCartItems(updatedCart);

        const adjustmentMessages = data.stockAdjustments.map(
          (adj) => `${pickLocale(adj.name)}: reduced from ${adj.requested} to ${adj.available}`
        );
        // react-hot-toast has no `.warning` method — base toast() with a
        // custom icon is the correct call here.
        toast(`Stock adjusted: ${adjustmentMessages.join(", ")}`, { icon: "⚠️" });

        onStockAdjusted?.(data.stockAdjustments);
      }

      if (isInitialLoad) setFatalError(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;

      const message = err instanceof Error ? err.message : "Failed to load cart details";
      if (isInitialLoad) {
        setFatalError(message);
      } else {
        // A cart is already on screen — don't wipe it out for a transient
        // revalidation failure, just surface a toast.
        toast.error(message);
      }
    } finally {
      if (isInitialLoad) setInitialLoading(false);
      setRevalidating(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const items = getCart();
    setCartItems(items);
    fetchCartDetails(items, true);

    const onUpdate = () => {
      const updatedItems = getCart();
      setCartItems(updatedItems);
      fetchCartDetails(updatedItems, false);
    };
    window.addEventListener("cart-update", onUpdate);
    return () => {
      window.removeEventListener("cart-update", onUpdate);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeQuantity(productId: string, newQty: number) {
    const validatedItem = validatedItems.find((i) => i.productId === productId);
    const maxAllowed = validatedItem ? validatedItem.stock : 999;

    if (!Number.isFinite(newQty) || newQty < 1) {
      updateCartItemQuantity(productId, 0);
    } else {
      const cappedQty = Math.min(Math.floor(newQty), maxAllowed);
      updateCartItemQuantity(productId, cappedQty);
    }
    setCartItems(getCart());
    fetchCartDetails(getCart(), false);
  }

  function remove(productId: string) {
    removeFromCart(productId);
    setCartItems(getCart());
    fetchCartDetails(getCart(), false);
  }

  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  return {
    mounted,
    initialLoading,
    revalidating,
    fatalError,
    cartItems,
    validatedItems,
    total,
    itemCount,
    changeQuantity,
    remove,
    retry: () => fetchCartDetails(cartItems, true),
  };
}