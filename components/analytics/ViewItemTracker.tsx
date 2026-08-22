"use client";

import { useEffect, useRef } from "react";
import { useConsent } from "@/contexts/ConsentContext";
import { trackViewItem } from "@/lib/analytics/events";

type Props = {
  itemId: string;
  itemName: string;
  price: number;
  currency: string;
};

export function ViewItemTracker({ itemId, itemName, price, currency }: Props) {
  const { ready, canTrackMarketing } = useConsent();
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!ready || !canTrackMarketing || !itemId) return;
    const key = `${itemId}:${price}`;
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;
    trackViewItem({ itemId, itemName, price, currency });
  }, [ready, canTrackMarketing, itemId, itemName, price, currency]);

  return null;
}
