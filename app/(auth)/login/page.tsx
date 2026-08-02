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
    // ✅ Fixed: added `relative` — the absolutely-positioned glow blobs
    //    below had no positioned ancestor, so they were anchoring to the
    //    nearest positioned element up the tree (or the viewport) instead
    //    of this card.
    <div className="relative min-h-[50dvh] flex flex-col">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[100px] md:left-1/4"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-blue-500/5 blur-[100px] md:right-12"
        aria-hidden
      />

      <div className="relative overflow-hidden rounded-[2rem] border border-gray-200 bg-white/90 shadow-2xl shadow-gray-200/40 backdrop-blur-2xl">
        <div className="relative p-8 sm:p-10 lg:p-12">

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 md:hidden">
              {APP_NAME}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="text-xs font-medium uppercase tracking-wider text-gray-500"
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
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-500/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="login-password"
                  className="text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Password
                </label>
                <span
                  className="cursor-not-allowed text-xs text-gray-400"
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
                  className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-4 pr-12 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-500/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Notices */}
            {successNotice && (
              <div
                role="status"
                className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700"
              >
                {successNotice}
              </div>
            )}
            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition-all hover:shadow-xl hover:shadow-blue-900/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="relative z-10">
                {isSubmitting ? "Signing in…" : "Sign in"}
              </span>
              <span
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-500">
            New here?{" "}
            <Link
              href="/register"
              className="font-medium text-blue-500 transition-colors hover:text-blue-400"
            >
              Create an account
            </Link>
            {" · "}
            <Link
              href="/"
              className="font-medium text-gray-500 transition-colors hover:text-gray-600"
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
    <div className="relative min-h-[50dvh] flex flex-col">
      <div className="relative overflow-hidden rounded-[2rem] border border-gray-200 bg-white/90 shadow-2xl shadow-gray-200/40 backdrop-blur-2xl">
        <div className="relative animate-pulse p-8 sm:p-10 lg:p-12">
          <div className="mb-8">
            <div className="h-3 w-24 rounded bg-gray-200 md:hidden" />
            <div className="mt-3 h-7 w-40 rounded-lg bg-gray-200" />
            <div className="mt-2 h-3.5 w-64 max-w-full rounded bg-gray-100" />
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="h-2.5 w-14 rounded bg-gray-200" />
              <div className="h-[52px] rounded-2xl bg-gray-100" />
            </div>
            <div className="space-y-2">
              <div className="h-2.5 w-20 rounded bg-gray-200" />
              <div className="h-[52px] rounded-2xl bg-gray-100" />
            </div>
            <div className="h-[52px] rounded-2xl bg-gray-200" />
          </div>

          <div className="mt-8 flex justify-center">
            <div className="h-3 w-56 max-w-full rounded bg-gray-100" />
          </div>
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