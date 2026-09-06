"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { publishMetaPixelId } from "@/lib/analytics/events";
import { applyConsentMode } from "@/lib/analytics/dataLayer";
import {
  getConsentSnapshot,
  subscribeConsent,
  writeStoredConsent,
} from "@/lib/consent/storage";
import type { ConsentChoices, ConsentRecord } from "@/lib/consent/types";

type ConsentContextValue = {
  ready: boolean;
  decision: ConsentRecord | null;
  preferencesOpen: boolean;
  canLoadTags: boolean;
  canTrackMarketing: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (choices: ConsentChoices) => void;
  openPreferences: () => void;
  closePreferences: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

function getServerSnapshot(): ConsentRecord | null {
  return null;
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const decision = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerSnapshot,
  );
  const [ready, setReady] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    setReady(true);
    if (decision) {
      applyConsentMode(decision);
      if (decision.marketing) publishMetaPixelId();
    }
  }, [decision]);

  const acceptAll = useCallback(() => {
    const record = writeStoredConsent({ analytics: true, marketing: true });
    applyConsentMode(record);
    setPreferencesOpen(false);
  }, []);

  const rejectAll = useCallback(() => {
    const record = writeStoredConsent({ analytics: false, marketing: false });
    applyConsentMode(record);
    setPreferencesOpen(false);
  }, []);

  const savePreferences = useCallback((choices: ConsentChoices) => {
    const record = writeStoredConsent(choices);
    applyConsentMode(record);
    setPreferencesOpen(false);
  }, []);

  const openPreferences = useCallback(() => setPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setPreferencesOpen(false), []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      ready,
      decision,
      preferencesOpen,
      canLoadTags: Boolean(decision?.analytics || decision?.marketing),
      canTrackMarketing: decision?.marketing === true,
      acceptAll,
      rejectAll,
      savePreferences,
      openPreferences,
      closePreferences,
    }),
    [
      ready,
      decision,
      preferencesOpen,
      acceptAll,
      rejectAll,
      savePreferences,
      openPreferences,
      closePreferences,
    ],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used within ConsentProvider");
  }
  return ctx;
}
