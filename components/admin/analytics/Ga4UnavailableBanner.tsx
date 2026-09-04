"use client";

import {
  ConnectGoogleAnalyticsButton,
  DisconnectGoogleAnalyticsButton,
} from "./ConnectGoogleAnalyticsButton";
import { useSearchParams } from "next/navigation";

const GA_QUERY_COPY: Record<string, string> = {
  connected: "Google Analytics is connected.",
  denied: "Google authorization was cancelled.",
  no_property:
    "That Google account cannot access the configured GA4 property.",
  error: "Could not connect Google Analytics. Try again.",
  oauth_not_configured:
    "Add GA4_PROPERTY_ID, GOOGLE_OAUTH_CLIENT_ID, and GOOGLE_OAUTH_CLIENT_SECRET on the backend first.",
};

export function Ga4OAuthFlash() {
  const searchParams = useSearchParams();
  const flash = searchParams.get("ga");
  const flashMessage = flash ? GA_QUERY_COPY[flash] : null;
  if (!flashMessage) return null;

  const error = flash !== "connected";
  return (
    <div
      role="status"
      className={`rounded-xl px-4 py-3 text-sm ${
        error
          ? "border border-amber-500/20 bg-amber-500/10 text-amber-200"
          : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
      }`}
    >
      {flashMessage}
    </div>
  );
}

export function Ga4ConnectBanner({
  needsConnect,
  connected,
  status,
  error,
}: {
  needsConnect: boolean;
  connected: boolean;
  status: string;
  error: string | null;
}) {
  const searchParams = useSearchParams();
  const flash = searchParams.get("ga");
  const flashMessage = flash ? GA_QUERY_COPY[flash] : null;

  if (connected && !flashMessage) return null;

  if (status === "unavailable") {
    return (
      <div
        role="status"
        className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3"
      >
        <p className="text-sm font-medium text-amber-200">
          Google Analytics data is temporarily unavailable.
        </p>
        <p className="mt-1 text-xs text-amber-200/80">
          {error || "Traffic could not be loaded. Order numbers below still come from your store."}
        </p>
        {needsConnect ? (
          <div className="mt-3">
            <ConnectGoogleAnalyticsButton />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      role="status"
      className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-4"
    >
      <p className="text-sm font-medium text-amber-200">
        {connected
          ? "Google Analytics"
          : needsConnect
            ? "Connect Google Analytics"
            : "Google Analytics is not configured."}
      </p>
      <p className="mt-1 text-xs text-amber-200/80">
        {flashMessage ||
          error ||
          "Sales figures below still come from your orders. Traffic needs a connected Google Analytics account."}
      </p>
      {needsConnect && !connected ? (
        <div className="mt-3">
          <ConnectGoogleAnalyticsButton />
        </div>
      ) : null}
    </div>
  );
}

export function Ga4ConnectedBar({
  propertyId,
}: {
  propertyId?: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
      <p className="text-xs text-slate-400">
        Google Analytics connected
        {propertyId ? ` · property ${propertyId}` : ""}
      </p>
      <DisconnectGoogleAnalyticsButton />
    </div>
  );
}

export function SalesUnavailableBanner({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3"
    >
      <p className="text-sm font-medium text-rose-200">
        Order data is temporarily unavailable.
      </p>
      <p className="mt-1 text-xs text-rose-200/80">{message}</p>
    </div>
  );
}
