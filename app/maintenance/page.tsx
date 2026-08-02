import type { Metadata } from "next";
import Image from "next/image";
import { APP_NAME, LOGO_PATH } from "@/lib/config";

export const metadata: Metadata = {
  title: "Maintenance",
  description: "The store is temporarily unavailable while we perform scheduled maintenance.",
  // A temporary notice must never end up in search results in place of the
  // storefront it is standing in for.
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="relative w-16 h-16 mx-auto mb-8">
          <Image
            src={LOGO_PATH}
            alt={APP_NAME}
            fill
            sizes="64px"
            className="object-contain"
            priority
          />
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B8935A] mb-4">
          {APP_NAME}
        </p>

        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1A1A1A] leading-snug">
          We&rsquo;re currently performing scheduled maintenance.
        </h1>

        <p className="mt-4 text-sm sm:text-base text-[#6B6560] leading-relaxed">
          We&rsquo;ll be back shortly.
        </p>

        <div className="mt-10 pt-6 border-t border-[#E8E2D9]">
          <p className="text-xs text-[#A09080]">
            Thank you for your patience.
          </p>
        </div>
      </div>
    </main>
  );
}
