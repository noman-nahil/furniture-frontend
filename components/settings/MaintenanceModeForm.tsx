"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/authClient";

type WebsiteSettings = {
  maintenanceMode: boolean;
  updatedAt: string | null;
};

type Props = {
  className?: string;
};

export function MaintenanceModeForm({ className = "" }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [savedValue, setSavedValue] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const settings = await apiFetch<WebsiteSettings>("/website-settings");
        if (cancelled) return;
        setEnabled(settings.maintenanceMode);
        setSavedValue(settings.maintenanceMode);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Could not load website settings.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setSaving(true);
      const settings = await apiFetch<WebsiteSettings>("/website-settings", {
        method: "PUT",
        body: JSON.stringify({ maintenanceMode: enabled }),
      });
      setEnabled(settings.maintenanceMode);
      setSavedValue(settings.maintenanceMode);
      setSuccess(
        settings.maintenanceMode
          ? "Maintenance mode is on. The storefront is closed to guests and customers."
          : "Maintenance mode is off. The storefront is open.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update maintenance mode.",
      );
    } finally {
      setSaving(false);
    }
  }

  const isDirty = enabled !== savedValue;

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-slate-100 mb-1">
        Maintenance mode
      </h3>
      <p className="text-[11px] text-slate-500 mb-4">
        While this is on, guests and customers are redirected to /maintenance.
        Admins and managers keep full access to the storefront and the
        dashboard. Changes reach visitors within 30 seconds.
      </p>

      {error && (
        <p className="mb-3 text-xs text-red-400 bg-red-950/40 border border-red-900/70 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-3 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900/60 rounded-md px-3 py-2">
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5">
          <span className="text-xs font-medium text-slate-200">
            Storefront maintenance
          </span>

          <div className="flex items-center gap-3">
            <span
              className={[
                "text-[11px] font-semibold uppercase tracking-wide",
                enabled ? "text-amber-400" : "text-slate-500",
              ].join(" ")}
            >
              {enabled ? "On" : "Off"}
            </span>

            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              aria-label="Maintenance mode"
              disabled={loading || saving}
              onClick={() => setEnabled((current) => !current)}
              className={[
                "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-60",
                enabled ? "bg-amber-500" : "bg-slate-700",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                  enabled ? "translate-x-[18px]" : "translate-x-[3px]",
                ].join(" ")}
              />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || saving || !isDirty}
          className="px-4 py-2 rounded-lg bg-slate-100 text-slate-900 text-xs font-semibold hover:bg-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
