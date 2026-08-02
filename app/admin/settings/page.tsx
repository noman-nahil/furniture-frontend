"use client";

import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { MaintenanceModeForm } from "@/components/settings/MaintenanceModeForm";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-slate-50">Settings</h2>
        <p className="text-xs text-slate-400">
          Website availability and account security for your admin session.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <MaintenanceModeForm />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
