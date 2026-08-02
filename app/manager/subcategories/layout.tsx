import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Subcategories",
  description: "Manage subcategories at Meubles De Paris.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
