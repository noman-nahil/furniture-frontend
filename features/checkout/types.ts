// features/checkout/types.ts
export type CheckoutStep = "delivery" | "success";

export type DeliveryFormValues = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  area: string;
};