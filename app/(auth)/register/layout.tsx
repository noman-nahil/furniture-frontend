import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a Meubles De Paris customer account.",
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <div className="w-full max-w-[420px]">{children}</div>;
}
