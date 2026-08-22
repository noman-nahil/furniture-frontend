import { describe, expect, it } from "vitest";
import {
  createConsentRecord,
  parseConsentRecord,
  readConsentCookie,
} from "./storage";
import { CONSENT_COOKIE_NAME, CONSENT_VERSION } from "./types";

describe("parseConsentRecord", () => {
  it("accepts a valid record", () => {
    const record = {
      v: CONSENT_VERSION,
      analytics: true,
      marketing: false,
      ts: 1_700_000_000_000,
    };
    expect(parseConsentRecord(record)).toEqual(record);
  });

  it("rejects a different version or bad types", () => {
    expect(parseConsentRecord({ v: 99, analytics: true, marketing: true, ts: 1 })).toBeNull();
    expect(parseConsentRecord({ v: 1, analytics: "yes", marketing: true, ts: 1 })).toBeNull();
    expect(parseConsentRecord(null)).toBeNull();
  });
});

describe("createConsentRecord", () => {
  it("stores the chosen categories", () => {
    const record = createConsentRecord({ analytics: false, marketing: true });
    expect(record.v).toBe(CONSENT_VERSION);
    expect(record.analytics).toBe(false);
    expect(record.marketing).toBe(true);
    expect(record.ts).toBeGreaterThan(0);
  });
});

describe("readConsentCookie", () => {
  it("reads the named cookie from a header string", () => {
    const record = {
      v: CONSENT_VERSION,
      analytics: true,
      marketing: true,
      ts: 42,
    };
    const header = `other=1; ${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(record))}`;
    expect(readConsentCookie(header)).toEqual(record);
  });

  it("returns null when the cookie is missing or invalid", () => {
    expect(readConsentCookie("session=abc")).toBeNull();
    expect(readConsentCookie(`${CONSENT_COOKIE_NAME}=%7Bnot-json`)).toBeNull();
    expect(readConsentCookie(undefined)).toBeNull();
  });
});
