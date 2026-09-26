import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="relative min-h-[calc(100vh-8rem)] overflow-hidden bg-[#F6F4F0] px-4 py-12 sm:py-16">
        <div className="relative flex min-h-[calc(100vh-12rem)] items-center justify-center">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}

