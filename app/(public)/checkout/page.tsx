import type { Metadata } from "next";
import CheckoutFlow from "@/features/checkout/CheckoutFlow";
import { getServerUser } from "@/lib/auth/getServerUser";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Complete your order with delivery details. Cash on delivery at Meubles De Paris.",
  openGraph: {
    title: "Checkout",
    description:
      "Complete your order with delivery details. Cash on delivery at Meubles De Paris.",
  },
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const user = await getServerUser();
  return <CheckoutFlow userData={user} />;
}