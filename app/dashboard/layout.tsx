import type { Metadata } from "next";
import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
export const metadata: Metadata = {
  title: "My Account",
  description: "Your Meubles De Paris customer dashboard.",
  openGraph: {
    title: "My Account",
    description: "Your Meubles De Paris customer dashboard.",
  },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>
  <Navbar />{children} <Footer /> </>;
}
