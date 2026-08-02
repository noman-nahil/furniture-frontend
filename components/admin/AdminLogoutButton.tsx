"use client";

import { useAuth } from "@/contexts/AuthContext";

export function AdminLogoutButton() {
  const { logout } = useAuth();

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="px-3 py-1.5 rounded-lg border border-slate-600 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
    >
      Log out
    </button>
  );
}
