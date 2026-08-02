/**
 * OTP: calls backend to send/verify OTP.
 * If backend is not ready, uses mock (OTP shown in UI for testing).
 */

const OTP_MOCK_KEY = "ministore-otp-mock";

import { getClientApiBaseUrl } from "@/lib/apiUrl";

function getBaseUrl(): string {
  if (typeof window === "undefined") return "";
  return getClientApiBaseUrl();
}

/** Send OTP to phone. Returns { success, message?, mockOtp? }. */
export async function sendOtp(name: string, phone: string): Promise<{
  success: boolean;
  message?: string;
  mockOtp?: string;
}> {
  const base = getBaseUrl();
  if (base) {
    try {
      const res = await fetch(`${base}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, message: data.message };
      return {
        success: false,
        message: (data.message as string) || "Failed to send OTP.",
      };
    } catch {
      return { success: false, message: "Network error. Using test OTP." };
    }
  }
  // Mock: generate 6-digit OTP and store in sessionStorage
  const mockOtp = String(Math.floor(100000 + Math.random() * 900000));
  sessionStorage.setItem(OTP_MOCK_KEY, JSON.stringify({ phone, otp: mockOtp }));
  return { success: true, mockOtp };
}

/** Verify OTP for phone. Returns { success, message? }. */
export async function verifyOtp(phone: string, otp: string): Promise<{
  success: boolean;
  message?: string;
}> {
  const base = getBaseUrl();
  if (base) {
    try {
      const res = await fetch(`${base}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return { success: true };
      return {
        success: false,
        message: (data.message as string) || "Invalid OTP.",
      };
    } catch {
      return { success: false, message: "Network error." };
    }
  }
  // Mock: check against sessionStorage
  const raw = sessionStorage.getItem(OTP_MOCK_KEY);
  if (!raw) return { success: false, message: "OTP expired. Please request again." };
  const { phone: storedPhone, otp: storedOtp } = JSON.parse(raw) as {
    phone: string;
    otp: string;
  };
  if (storedPhone !== phone || storedOtp !== otp)
    return { success: false, message: "Invalid OTP." };
  sessionStorage.removeItem(OTP_MOCK_KEY);
  return { success: true };
}
