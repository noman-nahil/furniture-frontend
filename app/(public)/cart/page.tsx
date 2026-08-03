import type { Metadata } from "next";
//import CartContent from "@/components/cart/CartContent";
import CartContent from "@/features/cart/CartContent";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review items in your cart before checkout at Meubles De Paris.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartContent />;
}
