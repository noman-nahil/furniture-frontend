"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getClientApiBaseUrl } from "@/lib/apiUrl";
import { APP_NAME } from "@/lib/config";
import { mapApiUserToAuthUser } from "@/lib/authUser";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type LoginResponse = {
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  accessToken?: string;
  error?: string;
};

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const ROLE_ROUTES: Record<string, string> = {
  admin: "/admin",
  manager: "/manager",
  customer: "/dashboard",
};

// ✅ Whitelist of allowed returnTo destinations — must match middleware.ts.
//    Prevents open redirect: ?returnTo=https://evil.com
const ALLOWED_RETURN_PREFIXES = [
  "/admin",
  "/manager",
  "/dashboard",
  "/products",
  "/checkout",
  "/cart",
  "/account",
];

function isSafeReturnTo(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//")) {
    return false;
  }
  return ALLOWED_RETURN_PREFIXES.some((prefix) => url.startsWith(prefix));
}

// ─────────────────────────────────────────────
// Inner component (needs useSearchParams → must be inside Suspense)
// ─────────────────────────────────────────────

function LoginContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ⚠️ NOTE: this effect calls logout() and lists it as a dependency.
  //    That's only safe if AuthContext memoizes `logout` (useCallback
  //    with a stable dep array, and a stable context value). If it's
  //    re-created on every render, this effect will re-fire and call
  //    logout() repeatedly while reason=session_expired stays in the URL.
  //    → Verify/fix in AuthContext.tsx rather than dropping the dep here.
  const { login, logout } = useAuth();

  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [error, setError]                 = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [isSubmitting, setIsSubmitting]   = useState(false);

  // ─── Handle ?reason= and ?registered= params ──────────────────────────
  useEffect(() => {
    const reason     = searchParams.get("reason");
    const registered = searchParams.get("registered");

    setSuccessNotice("");
    setError("");

    if (registered === "1") {
      setSuccessNotice("Account created. Sign in with your email and password.");
      return;
    }

    if (reason === "session_expired" || reason === "auth_error") {
      logout();
      setError("Your session has expired. Please log in again.");
    } else if (reason === "password_changed") {
      setSuccessNotice("Your password was updated. Sign in with your new password.");
    } else if (reason === "required") {
      setError("Please sign in to continue.");
    }
  }, [searchParams, logout]);

  // ─── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessNotice("");
    setIsSubmitting(true);

    try {
      const baseUrl = getClientApiBaseUrl();
      if (!baseUrl) {
        setError("API URL is not configured.");
        return;
      }

      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data: LoginResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Login failed.");
        return;
      }

      const apiUser = mapApiUserToAuthUser(data.user);
      const accessToken = data.accessToken;

      if (!apiUser || !accessToken) {
        setError("Login succeeded but session data was incomplete.");
        return;
      }

      login(apiUser, accessToken);

      const returnTo = searchParams.get("returnTo") ?? "";

      const destination = isSafeReturnTo(returnTo)
        ? returnTo
        : ROLE_ROUTES[apiUser.role] ?? "/dashboard";

      router.push(destination);
    } catch {
      setError("Unable to reach server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, login, searchParams, router]);

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      <div className="rounded-xl border border-[#E6E1D8] bg-white shadow-[0_1px_2px_rgba(26,26,26,0.04),0_12px_32px_rgba(26,26,26,0.06)]">
        <div className="border-b border-[#EFEBE4] px-8 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A8175]">
            {APP_NAME}
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-[#1A1A1A]">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-[#6B645C]">
            Enter your credentials to access your dashboard.
          </p>
        </div>

        <div className="px-8 py-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="text-xs font-medium text-[#5C564E]"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                autoFocus
                required
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-lg border border-[#E4DFD6] bg-[#FCFBF9] px-3.5 py-3 text-sm text-[#1A1A1A] placeholder:text-[#A39B91] outline-none transition-colors focus:border-[#1F6F5B] focus:bg-white focus:ring-2 focus:ring-[#1F6F5B]/15 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="login-password"
                  className="text-xs font-medium text-[#5C564E]"
                >
                  Password
                </label>
                <span
                  className="cursor-not-allowed text-xs text-[#A39B91]"
                  title="Contact an admin to reset your password"
                  aria-disabled="true"
                >
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#E4DFD6] bg-[#FCFBF9] py-3 pl-3.5 pr-14 text-sm text-[#1A1A1A] placeholder:text-[#A39B91] outline-none transition-colors focus:border-[#1F6F5B] focus:bg-white focus:ring-2 focus:ring-[#1F6F5B]/15 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={isSubmitting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-[#6B645C] transition-colors hover:bg-[#F3F0EA] hover:text-[#1A1A1A] disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {successNotice && (
              <div
                role="status"
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800"
              >
                {successNotice}
              </div>
            )}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#1F4D3A] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#173C2D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#8A8175]">
            New here?{" "}
            <Link
              href="/register"
              className="font-medium text-[#5C564E] transition-colors hover:text-[#1A1A1A]"
            >
              Create an account
            </Link>
            {" · "}
            <Link
              href="/"
              className="font-medium text-[#5C564E] transition-colors hover:text-[#1A1A1A]"
            >
              Browse store →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Skeleton (shown while useSearchParams resolves)
// ─────────────────────────────────────────────

function LoginSkeleton() {
  // ✅ Mirrors LoginContainer's shell exactly (same wrapper, background,
  //    border, radius, padding) so the Suspense swap from skeleton → real
  //    form doesn't cause a visible layout/color jump ("white flash").
  return (
    <div className="w-full">
      <div className="animate-pulse overflow-hidden rounded-xl border border-[#E6E1D8] bg-white">
        <div className="border-b border-[#EFEBE4] px-8 py-6">
          <div className="h-2.5 w-24 rounded bg-[#EFEBE4]" />
          <div className="mt-3 h-6 w-40 rounded bg-[#E6E1D8]" />
          <div className="mt-2 h-3.5 w-56 rounded bg-[#F3F0EA]" />
        </div>
        <div className="space-y-5 px-8 py-7">
          <div className="space-y-2">
            <div className="h-2.5 w-12 rounded bg-[#E6E1D8]" />
            <div className="h-11 rounded-lg bg-[#F3F0EA]" />
          </div>
          <div className="space-y-2">
            <div className="h-2.5 w-16 rounded bg-[#E6E1D8]" />
            <div className="h-11 rounded-lg bg-[#F3F0EA]" />
          </div>
          <div className="h-11 rounded-lg bg-[#E6E1D8]" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContainer />
    </Suspense>
  );
}