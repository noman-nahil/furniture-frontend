// features/checkout/components/OrderSummaryPanel.tsx
import Link from "next/link";
import { formatCurrency } from "@/lib/formatCurrency";
import { pickLocale } from "@/lib/locale";
import type { ValidatedCartItem } from "@/features/cart/types";

type OrderSummaryPanelProps = {
  validatedItems: ValidatedCartItem[];
  total: number;
  placeOrderLoading: boolean;
  onPlaceOrder: () => void;
};

export function OrderSummaryPanel({
  validatedItems,
  total,
  placeOrderLoading,
  onPlaceOrder,
}: OrderSummaryPanelProps) {
  return (
    <div className="lg:sticky lg:top-24 rounded-2xl border border-gray-200/80 bg-white shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Order summary</h2>
      <ul className="space-y-3 pb-4 border-b border-gray-100 max-h-48 overflow-y-auto">
        {validatedItems.map((item) => (
          <li key={item.productId} className="flex justify-between text-sm">
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
          onClick={onPlaceOrder}
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
  );
}