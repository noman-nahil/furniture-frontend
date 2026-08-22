"use client";

import { Suspense, type ReactNode } from "react";
import { ConsentProvider } from "@/contexts/ConsentContext";
import { CookieBanner } from "@/components/consent/CookieBanner";
import { CookiePreferences } from "@/components/consent/CookiePreferences";
import { GoogleTagManager } from "./GoogleTagManager";
import { GtmRouteTracker } from "./GtmRouteTracker";

export function ConsentAndAnalytics({ children }: { children: ReactNode }) {
  return (
    <ConsentProvider>
      {children}
      <CookieBanner />
      <CookiePreferences />
      <GoogleTagManager />
      <Suspense fallback={null}>
        <GtmRouteTracker />
      </Suspense>
    </ConsentProvider>
  );
}
