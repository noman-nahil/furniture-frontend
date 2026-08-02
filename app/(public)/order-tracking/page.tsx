"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchOrderTracking, formatTrackingReference, type OrderTracking } from "@/lib/order";
import { formatCurrency } from "@/lib/formatCurrency";
import { pickLocale } from "@/lib/locale";

const STATUS_STEPS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Order placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

function StatusStepper({ status }: { status: string }) {
  const isCancelled = status === "CANCELLED";
  const currentIndex = STATUS_STEPS.indexOf(status as (typeof STATUS_STEPS)[number]);
  const activeIndex = currentIndex >= 0 ? currentIndex : -1;

  if (isCancelled) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4">
        <p className="text-lg font-semibold text-red-800">
          {STATUS_LABELS.CANCELLED}
        </p>
        <p className="mt-1 text-sm text-red-600">This order has been cancelled.</p>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-1">
      {STATUS_STEPS.map((step, i) => {
        const isActive = i <= activeIndex;
        const isCurrent = i === activeIndex;
        const showConnector = i < STATUS_STEPS.length - 1;
        return (
          <div key={step} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-gray-900 text-white ring-4 ring-gray-900/20"
                    : "bg-gray-100 text-gray-400"
                } ${isCurrent ? "scale-110" : ""}`}
              >
                {isActive ? "✓" : i + 1}
              </div>
              {showConnector && (
                <div
                  className={`h-0.5 flex-1 min-w-[8px] ${
                    i < activeIndex ? "bg-gray-900" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
            <p
              className={`mt-2 text-center text-xs font-medium sm:text-sm ${
                isActive ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {STATUS_LABELS[step]}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function OrderResult({
  order,
  trackingToken,
}: {
  order: OrderTracking;
  trackingToken: string;
}) {
  const date = (() => {
    if (!order.createdAt) return "—";
    const d = new Date(order.createdAt);
    try {
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(d);
    } catch {
      return d.toLocaleString();
    }
  })();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Order reference</p>
            <p className="mt-1 font-mono text-xl font-bold tracking-tight text-gray-900">
              {formatTrackingReference(trackingToken)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500">Placed on</p>
            <p className="mt-1 text-gray-900">{date}</p>
          </div>
        </div>

        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Status
        </h3>
        <StatusStepper status={order.status} />
      </div>

      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Order details
        </h3>
        <ul className="space-y-3">
          {order.items.map((item, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-4 py-2 text-sm"
            >
              {/* item.name is now a possibly-localized field ({ fr, en? }),
                  same backend change as cart/checkout — pickLocale resolves
                  it to a string instead of crashing on rendering an object. */}
              <span className="text-gray-700">
                {pickLocale(item.name)} × {item.quantity}
              </span>
              <span className="font-medium tabular-nums text-gray-900">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-base font-semibold">
          <span>Subtotal</span>
          <span className="tabular-nums text-gray-900">
            {formatCurrency(order.subtotal)}
          </span>
        </div>
        {(order.deliveryCity || order.deliveryArea) && (
          <p className="mt-3 text-sm text-gray-500">
            Delivery: {[order.deliveryArea, order.deliveryCity].filter(Boolean).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token")?.trim() || "";

  const [trackingToken, setTrackingToken] = useState("");
  const [order, setOrder] = useState<OrderTracking | null>(null);
  const [activeToken, setActiveToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const loadOrder = useCallback(async (token: string) => {
    if (!token) return;
    setError("");
    setLoading(true);
    setSearched(true);
    const result = await fetchOrderTracking(token);
    setLoading(false);
    if (result.success && result.order) {
      setOrder(result.order);
      setActiveToken(token);
    } else {
      setOrder(null);
      setActiveToken("");
      setError(result.message || "Order not found.");
    }
  }, []);

  useEffect(() => {
    if (tokenFromUrl) {
      setTrackingToken(tokenFromUrl);
      void loadOrder(tokenFromUrl);
    }
  }, [tokenFromUrl, loadOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const token = trackingToken.trim();
    if (!token) {
      setError("Enter your tracking code.");
      setSearched(true);
      return;
    }
    void loadOrder(token);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Track your order
          </h1>
          <p className="mt-2 text-gray-500">
            Enter the tracking code from your confirmation email
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
            <input
              type="text"
              value={trackingToken}
              onChange={(e) => {
                setTrackingToken(e.target.value);
                setError("");
              }}
              placeholder="Tracking code from your email"
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gray-900 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-60"
            >
              {loading ? "Searching…" : "Track"}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
        </form>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            <p className="mt-4 text-sm text-gray-500">Loading order…</p>
          </div>
        )}

        {!loading && order && activeToken && (
          <OrderResult order={order} trackingToken={activeToken} />
        )}

        {!loading && searched && !order && !error && (
          <p className="text-center text-gray-500">No order found.</p>
        )}
      </div>
    </div>
  );
}

function OrderTrackingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-16">
      <div className="mx-auto max-w-2xl animate-pulse space-y-6">
        <div className="h-4 w-32 rounded bg-gray-200" />
        <div className="h-10 w-3/4 mx-auto rounded bg-gray-200" />
        <div className="h-12 w-full rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<OrderTrackingSkeleton />}>
      <OrderTrackingContent />
    </Suspense>
  );
}