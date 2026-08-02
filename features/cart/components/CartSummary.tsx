// features/cart/components/CartSummary.tsx
import Link from "next/link";
import { formatBDT } from "@/lib/productPrice";

type CartSummaryProps = {
  total: number;
};

export function CartSummary({ total }: CartSummaryProps) {
  return (
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
  );
}