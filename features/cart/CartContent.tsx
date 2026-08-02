// features/cart/CartContent.tsx
"use client";

import { useCartValidation } from "./hooks/useCartValidation";
import { CartItemRow } from "./components/CartItemRow";
import { CartSummary } from "./components/CartSummary";
import { EmptyCart } from "./components/EmptyCart";

export default function CartContent() {
  const {
    mounted,
    initialLoading,
    revalidating,
    fatalError,
    validatedItems,
    total,
    itemCount,
    changeQuantity,
    remove,
    retry,
  } = useCartValidation();

  if (!mounted) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">Loading cart...</div>;
  }

  if (initialLoading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">Validating cart...</div>;
  }

  if (fatalError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Cart Error</h2>
          <p className="text-red-700">{fatalError}</p>
          <button
            onClick={retry}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (validatedItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Shopping Cart</h1>
        {revalidating && <span className="text-xs text-gray-400">Updating…</span>}
      </div>

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
                <CartItemRow
                  key={item.productId}
                  item={item}
                  disabled={revalidating}
                  onQuantityChange={changeQuantity}
                  onRemove={remove}
                />
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-5">
          <CartSummary total={total} />
        </div>
      </div>
    </div>
  );
}