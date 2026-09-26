"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClientApiBaseUrl, joinApiUrl } from "@/lib/apiUrl";
import { APP_NAME } from "@/lib/config";

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

  const fieldClass =
    "w-full rounded-lg border border-[#E4DFD6] bg-[#FCFBF9] px-3.5 py-3 text-sm text-[#1A1A1A] placeholder:text-[#A39B91] outline-none transition-colors focus:border-[#1F6F5B] focus:bg-white focus:ring-2 focus:ring-[#1F6F5B]/15 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="w-full">
      <div className="rounded-xl border border-[#E6E1D8] bg-white shadow-[0_1px_2px_rgba(26,26,26,0.04),0_12px_32px_rgba(26,26,26,0.06)]">
        <div className="border-b border-[#EFEBE4] px-8 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A8175]">
            {APP_NAME}
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-[#1A1A1A]">
            Create account
          </h1>
          <p className="mt-1 text-sm text-[#6B645C]">
            Sign up to track orders and check out faster.
          </p>
        </div>

        <div className="px-8 py-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="register-name"
                className="text-xs font-medium text-[#5C564E]"
              >
                Name (optional)
              </label>
              <input
                id="register-name"
                type="text"
                name="name"
                autoComplete="name"
                disabled={isSubmitting}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="register-email"
                className="text-xs font-medium text-[#5C564E]"
              >
                Email
              </label>
              <input
                id="register-email"
                type="email"
                name="email"
                autoComplete="email"
                required
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="register-password"
                className="text-xs font-medium text-[#5C564E]"
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
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className={`${fieldClass} pr-14`}
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

            <div className="space-y-2">
              <label
                htmlFor="register-confirm"
                className="text-xs font-medium text-[#5C564E]"
              >
                Confirm password
              </label>
              <input
                id="register-confirm"
                type={showPassword ? "text" : "password"}
                name="confirm-password"
                autoComplete="new-password"
                required
                disabled={isSubmitting}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                className={fieldClass}
              />
            </div>

            {error ? (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800"
              >
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#1F4D3A] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#173C2D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#8A8175]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[#5C564E] transition-colors hover:text-[#1A1A1A]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
