import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Website and sales analytics for Meubles De Paris.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
