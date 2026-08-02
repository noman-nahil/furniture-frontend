"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getCart, setCart, type CartItem } from "@/lib/cart";
import { placeOrder, formatTrackingReference, type DeliveryAddress } from "@/lib/order";
import { cartApi } from "@/features/cart/api/cartApi";
import { formatCurrency } from "@/lib/formatCurrency";
// CHANGED: import the shared, already-fixed types instead of redeclaring
// a local (and now stale) ValidatedCartItem/StockAdjustment shape here.
import type { ValidatedCartItem, StockAdjustment } from "@/features/cart/types";
import type { LocalizedField } from "@/types/product";

// NEW: same locale-resolution helper used across ProductCard, PDP, and
// CartItemRow — falls back to French if the requested locale is missing.
function pickLocale(field: LocalizedField | string | undefined, locale: "fr" | "en" = "fr"): string {
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

type Step = "delivery" | "success";

export default function CheckoutFlow({ userData }: { userData: { name: string; email: string; phone?: string } | null }) {
  const router = useRouter();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [validatedItems, setValidatedItems] = useState<ValidatedCartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [step, setStep] = useState<Step>("delivery");

  // Delivery
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(userData?.phone || "");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");

  // Place order
  const [placeOrderLoading, setPlaceOrderLoading] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState("");
  const [trackingToken, setTrackingToken] = useState<string | null>(null);

  const [idempotencyKey] = useState(() =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
);

  const fetchValidatedCart = async (items: CartItem[], isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    }

    if (items.length === 0) {
      setValidatedItems([]);
      setTotal(0);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      if (isInitialLoad) {
        setError(null);
      }

      const data = await cartApi.validate(items);
      setValidatedItems(data.items);
      setTotal(data.total);

      if (data.stockAdjustments && data.stockAdjustments.length > 0) {
        const updatedCart = cartItems.map(cartItem => {
          const adjustment = data.stockAdjustments!.find(adj => adj.productId === cartItem.productId);
          if (adjustment) {
            return { ...cartItem, quantity: adjustment.available };
          }
          return cartItem;
        }).filter(item => item.quantity > 0);

        setCart(updatedCart);
        setCartItems(updatedCart);

        // CHANGED: adj.name is now { fr, en? } — resolve to a display
        // string before interpolating into the toast message, otherwise
        // this rendered "[object Object]: reduced from X to Y".
        const adjustmentMessages = data.stockAdjustments.map(
          (adj) => `${pickLocale(adj.name)}: reduced from ${adj.requested} to ${adj.available}`
        );
        toast(`Stock adjusted: ${adjustmentMessages.join(", ")}. Redirecting to cart...`, {
          icon: "⚠️",
        });

        setTimeout(() => {
          router.replace("/cart");
        }, 2000);
        return;
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to validate cart");
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    const items = getCart();
    setCartItems(items);
    fetchValidatedCart(items, true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (cartItems.length === 0 && step !== "success") {
      router.replace("/cart");
    }
  }, [mounted, cartItems.length, step, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handlePlaceOrder = async () => {
    const deliveryAddress: DeliveryAddress = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      area: area.trim() || undefined,
    };
    if (
      !deliveryAddress.name ||
      !deliveryAddress.phone ||
      !deliveryAddress.email ||
      !deliveryAddress.address ||
      !deliveryAddress.city
    ) {
      setPlaceOrderError("Please fill in name, phone, email, address and city.");
      return;
    }
    if (!EMAIL_RE.test(deliveryAddress.email)) {
      setPlaceOrderError("Please enter a valid email address.");
      return;
    }
    setPlaceOrderError("");
    setPlaceOrderLoading(true);
    
// In handlePlaceOrder, add to the placeOrder call:
const result = await placeOrder({
  items: validatedItems,
  subtotal: total,
  deliveryAddress,
  deliveryType: "cash_on_delivery",
  idempotencyKey, // NEW
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
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  if (!mounted || (cartItems.length === 0 && step !== "success")) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-gray-500">
        Validating cart...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Checkout Error</h2>
          <p className="text-red-700">{error}</p>
          <Link
            href="/cart"
            className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm p-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Order placed</h1>
          <p className="text-gray-600 mb-4">
            Thank you. Your order has been placed.
            {trackingToken && (
              <>
                {" "}
                Reference:{" "}
                <span className="font-mono font-semibold">
                  {formatTrackingReference(trackingToken)}
                </span>
              </>
            )}
          </p>
          <p className="text-sm text-gray-500 mb-6">Cash on delivery. We will contact you for delivery.</p>
          {trackingToken ? (
            <Link
              href={`/order-tracking?token=${encodeURIComponent(trackingToken)}`}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors mb-3"
            >
              Track your order
            </Link>
          ) : null}
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery address</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="checkout-name" className={labelClass}>
                  Full name
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="checkout-phone" className={labelClass}>
                  Phone
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  name="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="checkout-email" className={labelClass}>
                  Email
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="checkout-address" className={labelClass}>
                  Address (street / area)
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  name="street-address"
                  autoComplete="street-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House no, road, block"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkout-city" className={labelClass}>
                    City / District
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    name="address-level2"
                    autoComplete="address-level2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Dhaka"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="checkout-area" className={labelClass}>
                    Area (optional)
                  </label>
                  <input
                    id="checkout-area"
                    type="text"
                    name="address-line2"
                    autoComplete="address-line2"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Dhanmondi"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700">Delivery type</p>
              <p className="text-gray-500 text-sm mt-0.5">Cash on delivery (payment gateway coming later)</p>
            </div>

            {placeOrderError && <p className="mt-4 text-sm text-red-600">{placeOrderError}</p>}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 rounded-2xl border border-gray-200/80 bg-white shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order summary</h2>
            <ul className="space-y-3 pb-4 border-b border-gray-100 max-h-48 overflow-y-auto">
              {validatedItems.map((item) => (
                <li key={item.productId} className="flex justify-between text-sm">
                  {/* CHANGED: item.name is now { fr, en? } — this line was
                      the direct source of the crash. */}
                  <span className="text-gray-600 line-clamp-1">
                    {pickLocale(item.name)} × {item.quantity}
                  </span>
                  <span className="font-medium text-gray-900 tabular-nums">{formatCurrency(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <div className="py-4 border-b border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-gray-900 tabular-nums">{formatCurrency(total)}</span>
              </div>
            </div>
            <div className="pt-4">
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placeOrderLoading}
                className="w-full py-3.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60"
              >
                {placeOrderLoading ? "Placing order..." : "Place order (Cash on delivery)"}
              </button>
              <Link
                href="/cart"
                className="block w-full mt-3 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium text-center hover:bg-gray-50 transition-colors"
              >
                Back to cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}