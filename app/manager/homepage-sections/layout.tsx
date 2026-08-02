import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Homepage sections",
  description: "Curate the products shown in storefront homepage sections.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
