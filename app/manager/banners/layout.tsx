import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Banners",
  description: "Manage hero banners at Meubles De Paris.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
