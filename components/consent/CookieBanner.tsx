"use client";

import { usePathname } from "next/navigation";
import { useConsent } from "@/contexts/ConsentContext";
import { isStaffPath } from "@/lib/consent/routes";

export function CookieBanner() {
  const pathname = usePathname();
  const { ready, decision, acceptAll, rejectAll, openPreferences } = useConsent();

  if (!ready || decision || isStaffPath(pathname)) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className="fixed inset-x-0 bottom-0 z-[200] p-3 sm:p-4"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-[#E8E2D9] bg-[#FAFAF8] p-5 shadow-[0_12px_40px_rgba(26,26,26,0.16)] sm:p-6">
        <h2
          id="cookie-banner-title"
          className="text-base font-semibold tracking-tight text-[#1A1A1A]"
        >
          Nous respectons votre vie privée
        </h2>
        <p
          id="cookie-banner-desc"
          className="mt-2 text-sm leading-relaxed text-[#6B6560]"
        >
          Les cookies essentiels assurent le fonctionnement du site (panier,
          connexion, sécurité). Avec votre accord, nous chargeons Google Tag
          Manager et le pixel Meta pour mesurer l&apos;audience et l&apos;efficacité
          publicitaire. Vous pouvez accepter, refuser ou personnaliser. Le refus
          est aussi simple que l&apos;acceptation.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={rejectAll}
            className="min-h-11 rounded-xl border border-[#E8E2D9] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] transition-colors hover:bg-[#F0EBE3]"
          >
            Tout refuser
          </button>
          <button
            type="button"
            onClick={openPreferences}
            className="min-h-11 rounded-xl border border-[#E8E2D9] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] transition-colors hover:bg-[#F0EBE3]"
          >
            Personnaliser
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="min-h-11 rounded-xl bg-[#1A1A1A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#333]"
          >
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}
