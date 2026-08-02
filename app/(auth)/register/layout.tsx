import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a Meubles De Paris customer account.",
  openGraph: {
    title: "Sign Up",
    description: "Create a Meubles De Paris customer account.",
  },
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
