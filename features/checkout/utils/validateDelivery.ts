// features/checkout/utils/validateDelivery.ts
import { EMAIL_RE } from "../constants";
import type { DeliveryFormValues } from "../types";

/**
 * Validates delivery form values, returning an error message or null.
 * Pulled out of the component so it's testable in isolation and so
 * CheckoutFlow/useDeliveryForm don't duplicate this logic.
 */
export function validateDeliveryForm(values: DeliveryFormValues): string | null {
  const { name, phone, email, address, city } = values;

  if (!name.trim() || !phone.trim() || !email.trim() || !address.trim() || !city.trim()) {
    return "Please fill in name, phone, email, address and city.";
  }
  if (!EMAIL_RE.test(email.trim())) {
    return "Please enter a valid email address.";
  }
  return null;
}