"use client";

import type { ReactNode } from "react";
import { useConsent } from "@/contexts/ConsentContext";

type Props = {
  className?: string;
  children?: ReactNode;
};

export function CookieSettingsButton({ className, children }: Props) {
  const { ready, openPreferences } = useConsent();

  return (
    <button
      type="button"
      onClick={openPreferences}
      disabled={!ready}
      className={`bg-transparent p-0 text-left font-[inherit] disabled:opacity-60 ${className ?? ""}`}
    >
      {children ?? "Gestion des cookies"}
    </button>
  );
}
