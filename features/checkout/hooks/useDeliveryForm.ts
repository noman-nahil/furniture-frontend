// features/checkout/hooks/useDeliveryForm.ts
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { EMPTY_DELIVERY_FORM } from "../constants";
import { validateDeliveryForm } from "../utils/validateDelivery";
import type { DeliveryFormValues } from "../types";

export function useDeliveryForm(userData: { name: string; email: string; phone?: string } | null) {
  const { user } = useAuth();
  const [values, setValues] = useState<DeliveryFormValues>({
    ...EMPTY_DELIVERY_FORM,
    phone: userData?.phone || "",
  });

  // Prefill from the authenticated user once available — unchanged
  // behavior from the original component.
  useEffect(() => {
    if (user) {
      setValues((prev) => ({ ...prev, name: user.name || "", email: user.email || "" }));
    }
  }, [user]);

  function setField<K extends keyof DeliveryFormValues>(field: K, value: DeliveryFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function toDeliveryAddress() {
    return {
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      address: values.address.trim(),
      city: values.city.trim(),
      area: values.area.trim() || undefined,
    };
  }

  function validate(): string | null {
    return validateDeliveryForm(values);
  }

  return { values, setField, toDeliveryAddress, validate };
}