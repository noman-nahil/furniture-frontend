import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="relative min-h-[calc(100vh-8rem)] overflow-hidden bg-zinc-950 px-4 py-12 sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.12),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"
          aria-hidden
        />
        <div className="relative flex min-h-[calc(100vh-12rem)] items-center justify-center">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}

