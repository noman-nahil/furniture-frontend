"use client";

import { useEffect, useId, useState } from "react";
import { useConsent } from "@/contexts/ConsentContext";

function Toggle({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-[#E8E2D9] bg-white px-4 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-semibold text-[#1A1A1A]">
          {label}
        </label>
        <p className="mt-1 text-xs leading-relaxed text-[#6B6560]">{description}</p>
      </div>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-[#B8935A] disabled:opacity-60"
      />
    </div>
  );
}

export function CookiePreferences() {
  const necessaryId = useId();
  const analyticsId = useId();
  const marketingId = useId();
  const { preferencesOpen, decision, savePreferences, closePreferences, rejectAll } =
    useConsent();
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!preferencesOpen) return;
    setAnalytics(decision?.analytics === true);
    setMarketing(decision?.marketing === true);
  }, [preferencesOpen, decision]);

  if (!preferencesOpen) return null;

  return (
    <div className="fixed inset-0 z-[210] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Fermer les préférences cookies"
        className="absolute inset-0 bg-[#1A1A1A]/40"
        onClick={closePreferences}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-prefs-title"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-[#E8E2D9] bg-[#FAFAF8] p-5 shadow-[0_16px_48px_rgba(26,26,26,0.2)] sm:p-6"
      >
        <h2
          id="cookie-prefs-title"
          className="text-lg font-semibold tracking-tight text-[#1A1A1A]"
        >
          Préférences de cookies
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#6B6560]">
          Choisissez les catégories autorisées. Les cookies nécessaires restent
          toujours actifs.
        </p>

        <div className="mt-5 space-y-3">
          <Toggle
            id={necessaryId}
            label="Nécessaires"
            description="Panier, connexion, sécurité et mémorisation de votre choix cookies."
            checked
            disabled
          />
          <Toggle
            id={analyticsId}
            label="Mesure d’audience"
            description="Google Tag Manager pour des statistiques de fréquentation."
            checked={analytics}
            onChange={setAnalytics}
          />
          <Toggle
            id={marketingId}
            label="Publicité et réseaux sociaux"
            description="Pixel Meta (Facebook / Instagram) pour mesurer les campagnes."
            checked={marketing}
            onChange={setMarketing}
          />
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={rejectAll}
            className="min-h-11 rounded-xl border border-[#E8E2D9] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] hover:bg-[#F0EBE3]"
          >
            Tout refuser
          </button>
          <button
            type="button"
            onClick={() => savePreferences({ analytics, marketing })}
            className="min-h-11 rounded-xl bg-[#1A1A1A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#333]"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
