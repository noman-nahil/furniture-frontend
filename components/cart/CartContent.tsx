"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  getCart,
  setCart,
  updateCartItemQuantity,
  removeFromCart,
  type CartItem,
} from "@/lib/cart";
import { formatBDT } from "@/lib/productPrice";
import { cartApi } from "@/features/cart/api/cartApi";
import Image from "next/image";

type ValidatedCartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  slug?: string;
  image?: string;
  lineTotal: number;
  stock: number;
};

type CheckoutResponse = {
  items: ValidatedCartItem[];
  total: number;
  stockAdjustments?: {
    productId: string;
    name: string;
    requested: number;
    available: number;
  }[];
};

function r2Url(key: string): string {
  if (!key) return "";
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "") ?? "";
  return base ? `${base}/${key}` : key;
}




export default function CartContent() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [validatedItems, setValidatedItems] = useState<ValidatedCartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const fetchCartDetails = async (items: CartItem[], isInitialLoad = false) => {
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

      // Handle stock adjustments
      if (data.stockAdjustments && data.stockAdjustments.length > 0) {
        // Update cart quantities to match available stock
        const updatedCart = items.map(cartItem => {
          const adjustment = data.stockAdjustments!.find(adj => adj.productId === cartItem.productId);
          if (adjustment) {
            return { ...cartItem, quantity: adjustment.available };
          }
          return cartItem;
        }).filter(item => item.quantity > 0);

        setCart(updatedCart);
        setCartItems(updatedCart);

        // Show warning about stock adjustments
        const adjustmentMessages = data.stockAdjustments.map(
          adj => `${adj.name}: reduced from ${adj.requested} to ${adj.available}`
        );
        toast.warning(`Stock adjusted: ${adjustmentMessages.join(", ")}`);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cart details");
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
    fetchCartDetails(items, true);

    const onUpdate = () => {
      const updatedItems = getCart();
      setCartItems(updatedItems);
      fetchCartDetails(updatedItems, false);
    };
    window.addEventListener("cart-update", onUpdate);
    return () => window.removeEventListener("cart-update", onUpdate);
  }, []);

  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading cart...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">
        Validating cart...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Cart Error</h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => fetchCartDetails(cartItems, true)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (productId: string, newQty: number) => {
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
  };

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
    setCartItems(getCart());
    fetchCartDetails(getCart(), false);
  };

  if (validatedItems.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200/80 shadow-sm p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mb-6">Add items from the store to get started.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <span className="text-sm font-medium text-gray-500">
                {itemCount} item{itemCount === 1 ? "" : "s"}
              </span>
            </div>
            <ul className="divide-y divide-gray-100">
              {validatedItems.map((item) => (
                <li key={item.productId} className="p-4 sm:p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex gap-4">
                    <Link
                      href={item.slug ? `/products/${item.slug}` : "/products"}
                      className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-100 overflow-hidden ring-1 ring-gray-200/80"
                    >
                   <Image
                    src={item.image ? r2Url(item.image) : "/placeholder-product.png"}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={item.slug ? `/products/${item.slug}` : "/products"}
                        className="font-medium text-gray-900 hover:text-gray-700 line-clamp-2 text-[15px]"
                      >
                        {item.name}
                      </Link>
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-0.5">
                        <span className="text-sm text-gray-500 tabular-nums">
                          {formatBDT(item.price)} × {item.quantity}
                        </span>
                      </div>
                      <p className="text-base font-semibold text-gray-900 mt-2 tabular-nums">
                        {formatBDT(item.lineTotal)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between gap-2">
                      <div className="flex items-center rounded-lg border border-gray-200 bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(item.productId, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-l-md transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-gray-900 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(item.productId, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-r-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Increase quantity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.productId)}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                        aria-label="Remove from cart"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 rounded-2xl border border-gray-200/80 bg-white shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order summary</h2>
            <div className="space-y-3 pb-4 border-b border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900 tabular-nums">{formatBDT(total)}</span>
              </div>
            </div>
            <div className="pt-4 space-y-3">
              <Link
                href="/checkout"
                className="block w-full py-3.5 rounded-xl bg-gray-900 text-white text-sm font-semibold text-center hover:bg-gray-800 transition-colors"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/products"
                className="block w-full py-3.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium text-center hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
