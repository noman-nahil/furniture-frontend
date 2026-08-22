import {
  CONSENT_COOKIE_NAME,
  CONSENT_MAX_AGE_SECONDS,
  CONSENT_VERSION,
  type ConsentChoices,
  type ConsentRecord,
} from "./types";

export function createConsentRecord(choices: ConsentChoices): ConsentRecord {
  return {
    v: CONSENT_VERSION,
    analytics: choices.analytics,
    marketing: choices.marketing,
    ts: Date.now(),
  };
}

export function parseConsentRecord(value: unknown): ConsentRecord | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (record.v !== CONSENT_VERSION) return null;
  if (typeof record.analytics !== "boolean") return null;
  if (typeof record.marketing !== "boolean") return null;
  if (typeof record.ts !== "number" || !Number.isFinite(record.ts)) return null;
  return {
    v: CONSENT_VERSION,
    analytics: record.analytics,
    marketing: record.marketing,
    ts: record.ts,
  };
}

export function readConsentCookie(
  cookieHeader: string | undefined,
): ConsentRecord | null {
  if (!cookieHeader) return null;

  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${CONSENT_COOKIE_NAME}=`)) continue;
    const raw = trimmed.slice(CONSENT_COOKIE_NAME.length + 1);
    try {
      return parseConsentRecord(JSON.parse(decodeURIComponent(raw)));
    } catch {
      return null;
    }
  }
  return null;
}

const CONSENT_CHANGE_EVENT = "mdp-consent-change";

let snapshotCache: { raw: string; record: ConsentRecord | null } | null = null;

export function getConsentSnapshot(): ConsentRecord | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie;
  if (snapshotCache && snapshotCache.raw === raw) return snapshotCache.record;
  const record = readConsentCookie(raw);
  snapshotCache = { raw, record };
  return record;
}

export function readStoredConsent(): ConsentRecord | null {
  return getConsentSnapshot();
}

export function subscribeConsent(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CONSENT_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onStoreChange);
}

function notifyConsentChanged(): void {
  snapshotCache = null;
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
}

export function writeStoredConsent(choices: ConsentChoices): ConsentRecord {
  const record = createConsentRecord(choices);
  if (typeof document === "undefined") return record;

  const encoded = encodeURIComponent(JSON.stringify(record));
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie = [
    `${CONSENT_COOKIE_NAME}=${encoded}`,
    "Path=/",
    `Max-Age=${CONSENT_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
    secure,
  ]
    .filter(Boolean)
    .join("; ");

  notifyConsentChanged();
  return record;
}
