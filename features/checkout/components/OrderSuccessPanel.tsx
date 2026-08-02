// features/checkout/components/OrderSuccessPanel.tsx
import Link from "next/link";
import { formatTrackingReference } from "@/lib/order";

export function OrderSuccessPanel({
  trackingToken,
}: {
  trackingToken: string | null;
}) {
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