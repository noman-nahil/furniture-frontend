import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getCart, setCart, type CartItem } from "@/lib/cart";
import { placeOrder, type DeliveryAddress } from "@/lib/order";
import { cartApi } from "@/features/cart/api/cartApi";
import type { ValidatedCartItem, StockAdjustment } from "@/features/cart/types";
import type { LocalizedField } from "@/types/product";

export function pickLocale(field: LocalizedField | string | undefined, locale: "fr" | "en" = "fr"): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[locale] || field.fr || "";
}

type CheckoutResponse = {
  items: ValidatedCartItem[];
  total: number;
  stockAdjustments?: StockAdjustment[];
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Step = "delivery" | "success";

export type DeliveryFormState = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  area: string;
};

const EMPTY_ADDRESS: DeliveryFormState = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  area: "",
};

/**
 * Owns all checkout business logic: cart validation against the backend,
 * delivery form state, idempotent order placement, and step transitions.
 * Extracted from CheckoutFlow.tsx so the component itself only handles
 * rendering — makes each concern independently testable and lets the UI
 * layer stay thin and easy to code-split later (e.g. lazy-loading the
 * success screen).
 */
export function useCheckoutFlow(userData: { name: string; email: string; phone?: string } | null) {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [validatedItems, setValidatedItems] = useState<ValidatedCartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("delivery");

  const [form, setForm] = useState<DeliveryFormState>({
    ...EMPTY_ADDRESS,
    phone: userData?.phone || "",
  });

  const [placeOrderLoading, setPlaceOrderLoading] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState("");
  const [trackingToken, setTrackingToken] = useState<string | null>(null);

  // Generated once per mount, reused across retries of the same checkout
  // attempt so the backend's idempotency check can recognize a resubmit.
  const [idempotencyKey] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  // NEW: guards against setState-after-unmount and lets an in-flight
  // validation request be abandoned if the user navigates away mid-fetch.
  const abortRef = useRef<AbortController | null>(null);

  const fetchValidatedCart = useCallback(async (items: CartItem[], isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);

    if (items.length === 0) {
      setValidatedItems([]);
      setTotal(0);
      setError(null);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (isInitialLoad) setError(null);

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
        toast(`Stock adjusted: ${adjustmentMessages.join(", ")}. Redirecting to cart...`, { icon: "⚠️" });

        setTimeout(() => router.replace("/cart"), 2000);
        return;
      }

      setError(null);
    } catch (err) {
      // Ignore aborted requests — this is an intentional cancellation,
      // not a real failure, and shouldn't surface an error to the user.
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to validate cart");
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    setMounted(true);
    const items = getCart();
    setCartItems(items);
    fetchValidatedCart(items, true);
    return () => abortRef.current?.abort();
  }, [fetchValidatedCart]);

  useEffect(() => {
    if (!mounted) return;
    if (cartItems.length === 0 && step !== "success") {
      router.replace("/cart");
    }
  }, [mounted, cartItems.length, step, router]);

  useEffect(() => {
    if (userData) {
      setForm((f) => ({ ...f, name: userData.name || f.name, email: userData.email || f.email }));
    }
  }, [userData]);

  const updateField = useCallback(<K extends keyof DeliveryFormState>(key: K, value: DeliveryFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const handlePlaceOrder = useCallback(async () => {
    const deliveryAddress: DeliveryAddress = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      area: form.area.trim() || undefined,
    };

    if (!deliveryAddress.name || !deliveryAddress.phone || !deliveryAddress.email || !deliveryAddress.address || !deliveryAddress.city) {
      setPlaceOrderError("Please fill in name, phone, email, address and city.");
      return;
    }
    if (!EMAIL_RE.test(deliveryAddress.email)) {
      setPlaceOrderError("Please enter a valid email address.");
      return;
    }

    setPlaceOrderError("");
    setPlaceOrderLoading(true);

    const result = await placeOrder({
      items: validatedItems,
      subtotal: total,
      deliveryAddress,
      deliveryType: "cash_on_delivery",
      idempotencyKey,
    });

    setPlaceOrderLoading(false);

    if (result.success) {
      setCart([]);
      setCartItems([]);
      setValidatedItems([]);
      window.dispatchEvent(new CustomEvent("cart-update"));
      setTrackingToken(result.trackingToken || null);
      setStep("success");
    } else {
      setPlaceOrderError(result.message || "Failed to place order.");
    }
  }, [form, validatedItems, total, idempotencyKey]);

  return {
    // state for rendering
    mounted, loading, error, step, cartItems, validatedItems, total,
    form, placeOrderLoading, placeOrderError, trackingToken,
    // actions
    updateField, handlePlaceOrder,
  };
}