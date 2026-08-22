"use client";

import { useConsent } from "@/contexts/ConsentContext";

type Props = {
  className?: string;
};

export function CookieSettingsButton({ className }: Props) {
  const { ready, openPreferences } = useConsent();

  return (
    <button
      type="button"
      onClick={openPreferences}
      disabled={!ready}
      className={`bg-transparent p-0 text-left font-[inherit] disabled:opacity-60 ${className ?? ""}`}
    >
      Gestion des cookies
    </button>
  );
}
