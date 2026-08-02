// features/checkout/CheckoutFlow.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCheckoutValidation } from "./hooks/useCheckoutValidation";
import { useDeliveryForm } from "./hooks/useDeliveryForm";
import { usePlaceOrder } from "./hooks/usePlaceOrder";
import { DeliveryAddressForm } from "./components/DeliveryAddressForm";
import { OrderSummaryPanel } from "./components/OrderSummaryPanel";
import { OrderSuccessPanel } from "./components/OrderSuccessPanel";
import type { CheckoutStep } from "./types";

type CheckoutFlowProps = {
  userData: { name: string; email: string; phone?: string } | null;
};

export default function CheckoutFlow({ userData }: CheckoutFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<CheckoutStep>("delivery");

  const { mounted, initialLoading, fatalError, cartItems, validatedItems, total, retry } =
    useCheckoutValidation();

  const deliveryForm = useDeliveryForm(userData);
  const placeOrder = usePlaceOrder();

  // Redirect to /cart if the local cart is empty — mirrors the original
  // component's behavior exactly (checks raw cartItems, not validatedItems,
  // so it can redirect before validation even finishes).
  useEffect(() => {
    if (!mounted) return;
    if (cartItems.length === 0 && step !== "success") {
      router.replace("/cart");
    }
  }, [mounted, cartItems.length, step, router]);

  const [validationError, setValidationError] = useState("");

  async function handlePlaceOrder() {
    const formError = deliveryForm.validate();
    if (formError) {
      setValidationError(formError);
      return;
    }
    setValidationError("");

    const success = await placeOrder.submit(deliveryForm.toDeliveryAddress(), validatedItems, total);
    if (success) setStep("success");
  }

  if (!mounted || (cartItems.length === 0 && step !== "success")) {
    return <div className="max-w-lg mx-auto px-4 py-16 text-center text-gray-500">Loading...</div>;
  }

  if (initialLoading) {
    return <div className="max-w-lg mx-auto px-4 py-16 text-center text-gray-500">Validating cart...</div>;
  }

  if (fatalError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Checkout Error</h2>
          <p className="text-red-700">{fatalError}</p>
          <button
            onClick={retry}
            className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return <OrderSuccessPanel trackingToken={placeOrder.trackingToken} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-7">
          <DeliveryAddressForm form={deliveryForm} placeOrderError={validationError || placeOrder.error} />
        </div>

        <div className="lg:col-span-5">
          <OrderSummaryPanel
            validatedItems={validatedItems}
            total={total}
            placeOrderLoading={placeOrder.loading}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>
      </div>
    </div>
  );
}