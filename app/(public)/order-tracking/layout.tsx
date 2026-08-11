import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildPageMetadata } from "@/lib/seo/metadata";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = buildPageMetadata({
  title: "Track Order",
  description: `Track your order status and details with your order ID at ${APP_NAME}.`,
  path: "/order-tracking",
  noIndex: true,
  noFollow: true,
});

export default function OrderTrackingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
