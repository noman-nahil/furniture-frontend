"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export type ProtectedRole = "admin" | "manager" | "customer";

type Props = {
  children: React.ReactNode;
  allow: ProtectedRole[] | "any";
};

export default function Protected({ children, allow }: Props) {
  const { isLoggedIn, user, isReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isReady) return;
    if (!isLoggedIn) {
      const search = new URLSearchParams({ returnTo: pathname }).toString();
      router.replace(`/login?${search}`);
      return;
    }

    if (allow !== "any" && user) {
      const role = user.role as ProtectedRole;
      const isAllowed = allow.includes(role);
      if (!isAllowed) {
        if (role === "admin") {
          router.replace("/admin");
        } else if (role === "manager") {
          router.replace("/manager");
        } else {
          router.replace("/dashboard");
        }
      }
    }
  }, [allow, isLoggedIn, isReady, pathname, router, user]);

  if (!isReady || !isLoggedIn) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-slate-400">
        Checking your session...
      </div>
    );
  }

  if (
    allow !== "any" &&
    user &&
    !allow.includes(user.role as ProtectedRole)
  ) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-6 py-4 text-sm text-slate-100">
          You don&apos;t have permission to view this page.
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
