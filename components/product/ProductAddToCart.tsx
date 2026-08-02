"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { addToCart,isProductInCart } from "@/lib/cart";
import { getFinalPrice, hasProductDiscount } from "@/lib/productPrice";
import type { StoreProduct } from "@/types/product";
import toast from "react-hot-toast";

type Props = {
  product: StoreProduct;
};

function isBuyableStatus(status?: string): boolean {
  return status == null || status === "active";
}

export default function ProductAddToCart({ product }: Props) {
  const router = useRouter();

  const stock = product.quantity ?? 0;
  const maxQty = stock > 0 ? stock : 0;
  const outOfStock = stock <= 0;
  const notActive = !isBuyableStatus(product.status);
  const disabled = outOfStock || notActive;

  const [quantity, setQuantity] = useState(1);

  // ✅ Removed useMemo — getFinalPrice is a pure, cheap calculation.
  //    useMemo adds overhead (closure + dependency tracking) that costs
  //    more than just calling the function directly on render.
  const linePrice = getFinalPrice(product);
  const listPrice = product.price;
  const showOriginal = hasProductDiscount(product) && listPrice > linePrice;

  const handleDecrement = useCallback(() => {
    setQuantity((q) => Math.max(1, q - 1));
  }, []);

  const handleIncrement = useCallback(() => {
    setQuantity((q) => (maxQty > 0 ? Math.min(maxQty, q + 1) : q));
  }, [maxQty]);

  const handleQuantityInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseInt(e.target.value, 10);
      if (Number.isNaN(v)) return;
      const cap = maxQty > 0 ? maxQty : 1;
      setQuantity(Math.max(1, Math.min(cap, v)));
    },
    [maxQty]
  );

  // ✅ Extracted shared cart logic — previously duplicated verbatim
  //    in both handleAddToCart and handleBuyNow.
  const addToCartOrError = useCallback((): boolean => {
    if (notActive) {
      toast.error("This product is not available.");
      return false;
    }
    if (isProductInCart(product._id)) {
  toast("Already in your cart 🛒");
  return false;
}
    const result = addToCart({
      productId: product._id,
      quantity,
      maxQuantity: maxQty,
    });
    if (!result.ok) {
      toast.error(result.reason);
      return false;
    }
    return true;
  }, [product._id, quantity, maxQty, notActive]);

  const handleAddToCart = useCallback(() => {
    if (addToCartOrError()) {
      toast.success("Added to cart 🛒");
    }
  }, [addToCartOrError]);

  const handleBuyNow = useCallback(() => {
    if (addToCartOrError()) {
      toast.success("Added — continue to checkout");
      router.push("/checkout");
    }
  }, [addToCartOrError, router]);

  return (
    <div className="space-y-5 border-t border-gray-200 pt-6 sm:space-y-4">
      {/* Quantity selector */}
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
        <label className="text-sm font-medium text-gray-700">Quantity:</label>
        <div className="flex items-stretch overflow-hidden rounded-lg border border-gray-300">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={quantity <= 1 || disabled}
            className="flex h-11 w-11 shrink-0 items-center justify-center text-lg text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:h-auto sm:w-auto sm:px-4 sm:py-2 sm:text-base"
            aria-label="Decrease quantity"
          >
            −
          </button>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            min={1}
            max={maxQty || 1}
            value={quantity}
            onChange={handleQuantityInput}
            disabled={disabled}
            className="h-11 w-14 shrink-0 border-x border-gray-300 px-2 text-center text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 sm:h-auto sm:w-16 sm:py-2 sm:text-base"
            aria-label="Quantity"
          />

          <button
            type="button"
            onClick={handleIncrement}
            disabled={quantity >= maxQty || disabled}
            className="flex h-11 w-11 shrink-0 items-center justify-center text-lg text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:h-auto sm:w-auto sm:px-4 sm:py-2 sm:text-base"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={disabled}
          className="min-h-11 w-full flex-1 rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:py-4 sm:text-lg"
        >
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={disabled}
          className="min-h-11 w-full rounded-lg border-2 border-gray-300 px-8 py-3 text-base font-semibold text-gray-700 transition-colors duration-200 hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-4 sm:text-lg"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}