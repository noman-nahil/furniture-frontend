"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/authClient";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  /** Shown above the form */
  className?: string;
};

export function ChangePasswordForm({ className = "" }: Props) {
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    try {
      setSubmitting(true);
      await apiFetch<{ success?: boolean; message?: string }>(
        "/auth/change-password",
        {
          method: "POST",
          body: JSON.stringify({ currentPassword, newPassword }),
        },
      );
      setSuccess("Password updated. Redirecting to sign in…");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await logout("password_changed");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not change password.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-slate-100 mb-1">
        Change password
      </h3>
      <p className="text-[11px] text-slate-500 mb-4">
        After a successful change you will be signed out on this device and need
        to log in with your new password.
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

      <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
        <div>
          <label className="block text-xs font-medium text-slate-200 mb-1">
            Current password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-200 mb-1">
            New password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-200 mb-1">
            Confirm new password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg bg-slate-100 text-slate-900 text-xs font-semibold hover:bg-white disabled:opacity-60"
        >
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
