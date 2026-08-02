import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Homepage sections",
  description: "Manage storefront homepage sections at Meubles De Paris.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
