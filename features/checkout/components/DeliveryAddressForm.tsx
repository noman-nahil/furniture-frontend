// features/checkout/components/DeliveryAddressForm.tsx
"use client";

import type { useDeliveryForm } from "../hooks/useDeliveryForm";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow";
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

type DeliveryAddressFormProps = {
  form: ReturnType<typeof useDeliveryForm>;
  placeOrderError: string;
};

export function DeliveryAddressForm({ form, placeOrderError }: DeliveryAddressFormProps) {
  const { values, setField } = form;

  return (
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
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
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
            value={values.phone}
            onChange={(e) => setField("phone", e.target.value)}
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
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
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
            value={values.address}
            onChange={(e) => setField("address", e.target.value)}
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
              value={values.city}
              onChange={(e) => setField("city", e.target.value)}
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
              value={values.area}
              onChange={(e) => setField("area", e.target.value)}
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
  );
}