import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Track Order",
  description:
    "Track your order status and details with your order ID at Meubles De Paris.",
  openGraph: {
    title: "Track Order",
    description:
      "Track your order status and details with your order ID at Meubles De Paris.",
  },
};

export default function OrderTrackingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
