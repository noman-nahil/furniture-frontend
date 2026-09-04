"use client";

import { getClientApiBaseUrl, joinApiUrl } from "@/lib/apiUrl";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ConnectGoogleAnalyticsButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onConnect() {
    const apiBase = getClientApiBaseUrl();
    if (!apiBase) {
      setError(
        "NEXT_PUBLIC_API_URL is not set, so Google Analytics cannot be connected.",
      );
      return;
    }

    setPending(true);
    setError("");
    try {
      const res = await authenticatedFetch(
        joinApiUrl(apiBase, "/analytics/google/connect"),
        { method: "POST" },
      );
      const body = await res.json().catch(() => ({}));
      if (res.status === 503 && body.code === "oauth_not_configured") {
        throw new Error(
          "Add GA4_PROPERTY_ID, GOOGLE_OAUTH_CLIENT_ID, and GOOGLE_OAUTH_CLIENT_SECRET on the backend first.",
        );
      }
      if (!res.ok || !body.url) {
        throw new Error("Could not start Google authorization.");
      }
      window.location.assign(body.url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not connect. Try again.",
      );
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void onConnect()}
        disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white disabled:opacity-60"
      >
        {pending ? "Connecting…" : "Connect Google Analytics"}
      </button>
      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}

export function DisconnectGoogleAnalyticsButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onDisconnect() {
    setPending(true);
    setError("");
    try {
      const apiBase = getClientApiBaseUrl();
      const res = await authenticatedFetch(
        joinApiUrl(apiBase, "/analytics/google/disconnect"),
        { method: "POST" },
      );
      if (!res.ok) {
        throw new Error("Disconnect failed");
      }
      router.refresh();
    } catch {
      setError("Could not disconnect. Try again.");
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void onDisconnect()}
        disabled={pending}
        className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? "Disconnecting…" : "Disconnect"}
      </button>
      {error ? <p className="mt-1 text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
