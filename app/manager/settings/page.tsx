"use client";

import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";

export default function ManagerSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-slate-50">Settings</h2>
        <p className="text-xs text-slate-400">
          Account security for your manager session.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
