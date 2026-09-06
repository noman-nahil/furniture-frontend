import { readStoredConsent } from "@/lib/consent/storage";

export type MetaCapiContext = {
  event_id: string;
  fbp?: string;
  fbc?: string;
  event_source_url?: string;
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    if (part.startsWith(prefix)) {
      try {
        return decodeURIComponent(part.slice(prefix.length));
      } catch {
        return part.slice(prefix.length);
      }
    }
  }
  return null;
}

function readQueryParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return new URL(window.location.href).searchParams.get(name);
  } catch {
    return null;
  }
}

const FBCLID_RE = /^[A-Za-z0-9_-]{8,512}$/;
const FBP_RE = /^fb\.\d+\.\d+\.\d+$/;
const FBC_RE = /^fb\.\d+\.\d+\.[A-Za-z0-9_-]+$/;

function sanitizeFbclid(value: string): string | undefined {
  const trimmed = value.trim();
  return FBCLID_RE.test(trimmed) ? trimmed : undefined;
}

function sanitizeFbp(value: string | undefined): string | undefined {
  return value && FBP_RE.test(value) ? value : undefined;
}

function sanitizeFbc(value: string | undefined): string | undefined {
  return value && FBC_RE.test(value) ? value : undefined;
}

/** Reconstruct `_fbc` from `fbclid` when the cookie is not set yet. */
function buildFbcFromClickId(fbclid: string): string | undefined {
  const clean = sanitizeFbclid(fbclid);
  if (!clean) return undefined;
  return `fb.1.${Date.now()}.${clean}`;
}

export function createAnalyticsEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function readMetaClickIds(): { fbp?: string; fbc?: string } {
  const fbp = sanitizeFbp(readCookie("_fbp") || undefined);
  const fbcCookie = sanitizeFbc(readCookie("_fbc") || undefined);
  if (fbcCookie) return { fbp, fbc: fbcCookie };

  const fbclid = readQueryParam("fbclid");
  if (fbclid) {
    const fbc = buildFbcFromClickId(fbclid);
    return fbc ? { fbp, fbc } : { fbp };
  }
  return { fbp };
}

/**
 * Browser context for Graph API `user_data` + Pixel/CAPI `event_id` dedup.
 * Returns null unless marketing consent is granted.
 */
export function getMetaCapiContext(): MetaCapiContext | null {
  if (typeof window === "undefined") return null;
  if (readStoredConsent()?.marketing !== true) return null;

  const clickIds = readMetaClickIds();
  return {
    event_id: createAnalyticsEventId(),
    ...clickIds,
    event_source_url: window.location.href,
  };
}
