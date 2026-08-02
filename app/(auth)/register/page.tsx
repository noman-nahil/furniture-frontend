"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClientApiBaseUrl, joinApiUrl } from "@/lib/apiUrl";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const baseUrl = getClientApiBaseUrl();
    if (!baseUrl) {
      setError("API URL is not configured.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(joinApiUrl(baseUrl, "/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          (typeof data?.error === "string" && data.error) ||
            "Registration failed.",
        );
        setIsSubmitting(false);
        return;
      }
      router.push("/login?registered=1");
    } catch {
      setError("Unable to reach server. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="relative w-full max-w-md rounded-[2rem] border border-slate-700/60 p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Create account
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Sign up to track orders and check out faster.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="register-name"
            className="text-xs font-medium uppercase tracking-wider text-slate-400"
          >
            Name (optional)
          </label>
          <input
            id="register-name"
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/50 px-4 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none transition-all focus:border-amber-500/50 focus:bg-slate-900/80 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="register-email"
            className="text-xs font-medium uppercase tracking-wider text-slate-400"
          >
            Email
          </label>
          <input
            id="register-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/50 px-4 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none transition-all focus:border-amber-500/50 focus:bg-slate-900/80 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="register-password"
            className="text-xs font-medium uppercase tracking-wider text-slate-400"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              name="new-password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/50 py-3.5 pl-4 pr-12 text-sm text-white placeholder:text-slate-600 outline-none transition-all focus:border-amber-500/50 focus:bg-slate-900/80 focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="register-confirm"
            className="text-xs font-medium uppercase tracking-wider text-slate-400"
          >
            Confirm password
          </label>
          <input
            id="register-confirm"
            type={showPassword ? "text" : "password"}
            name="confirm-password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password"
            className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/50 px-4 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none transition-all focus:border-amber-500/50 focus:bg-slate-900/80 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200/90"
          >
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-900/30 transition-all hover:shadow-xl hover:shadow-amber-900/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-amber-500/90 transition-colors hover:text-amber-400"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
