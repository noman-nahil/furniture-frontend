/**
 * Maintenance-mode lookup for middleware.ts (Edge-safe).
 *
 * Middleware runs on every storefront request, so the answer is cached in
 * module scope and concurrent misses share a single in-flight request. Each
 * server instance therefore asks the API at most twice a minute, and a toggle
 * made in the admin panel rolls out within MAINTENANCE_CACHE_TTL_MS.
 */

import { joinApiUrl } from "@/lib/apiUrl";

const MAINTENANCE_CACHE_TTL_MS = 30_000;
const REQUEST_TIMEOUT_MS = 2_000;

/** Path on the storefront that shows the maintenance notice. */
export const MAINTENANCE_PATH = "/maintenance";

let lastKnownValue = false;
let cachedUntil = 0;
let inFlight: Promise<boolean> | null = null;

async function fetchMaintenanceMode(): Promise<boolean> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    console.error("[maintenance] NEXT_PUBLIC_API_URL is not set");
    return lastKnownValue;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(joinApiUrl(baseUrl, "/website-settings"), {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Settings request failed (${res.status})`);
    }

    const data = (await res.json()) as { maintenanceMode?: unknown };
    return data.maintenanceMode === true;
  } catch (err) {
    // Fail open: an unreachable settings API must never take the storefront
    // offline by itself, so keep serving the last answer we trusted.
    console.error("[maintenance] settings lookup failed", err);
    return lastKnownValue;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** True when the storefront should be closed to guests and customers. */
export async function isMaintenanceModeEnabled(): Promise<boolean> {
  if (Date.now() < cachedUntil) {
    return lastKnownValue;
  }

  if (!inFlight) {
    inFlight = fetchMaintenanceMode()
      .then((value) => {
        lastKnownValue = value;
        cachedUntil = Date.now() + MAINTENANCE_CACHE_TTL_MS;
        return value;
      })
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
}
