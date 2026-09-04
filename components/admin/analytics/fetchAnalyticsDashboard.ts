import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { joinApiUrl } from "@/lib/apiUrl";
import type { AnalyticsDashboardResponse } from "@/types/adminAnalytics";

export type AnalyticsFetchFailure = {
  ok: false;
  kind: "config" | "error" | "bad_range";
};

export type AnalyticsFetchResult =
  | { ok: true; data: AnalyticsDashboardResponse }
  | AnalyticsFetchFailure;

function isDashboardShape(value: unknown): value is AnalyticsDashboardResponse {
  if (!value || typeof value !== "object") return false;
  const data = value as AnalyticsDashboardResponse;
  return Boolean(data.range && data.ga4 && data.sales);
}

export async function fetchAnalyticsDashboard(
  query: string,
): Promise<AnalyticsFetchResult> {
  const baseUrl = process.env.BACKEND_URL;
  if (!baseUrl) {
    console.error("[Analytics] BACKEND_URL is not set");
    return { ok: false, kind: "config" };
  }

  const cookieStore = await cookies();
  const suffix = query ? `?${query}` : "";
  const url = `${joinApiUrl(baseUrl, "/analytics/dashboard")}${suffix}`;
  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        Cookie: cookieStore.toString(),
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
  } catch (error) {
    console.error("[Analytics] Failed to fetch dashboard:", error);
    return { ok: false, kind: "error" };
  }

  if (response.status === 401) {
    redirect("/login?reason=session_expired");
  }

  if (response.status === 400) {
    return { ok: false, kind: "bad_range" };
  }

  if (!response.ok) {
    console.error(
      `[Analytics] ${url} returned ${response.status}. SSR uses BACKEND_URL; it must be the backend that has GET /api/analytics/dashboard (local: http://localhost:5000/api).`,
    );
    return { ok: false, kind: "error" };
  }

  try {
    const data: unknown = await response.json();
    if (!isDashboardShape(data)) {
      console.error("[Analytics] Unexpected response shape");
      return { ok: false, kind: "error" };
    }
    return { ok: true, data };
  } catch (error) {
    console.error("[Analytics] Failed to parse dashboard:", error);
    return { ok: false, kind: "error" };
  }
}
