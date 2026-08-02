import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage customer and staff accounts at Meubles De Paris.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
