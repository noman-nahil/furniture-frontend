import { describe, expect, it } from "vitest";
import { parseAnalyticsSearchParams, analyticsPageHref } from "./analyticsRange";

describe("parseAnalyticsSearchParams", () => {
  it("defaults to last 7 days", () => {
    const parsed = parseAnalyticsSearchParams({});
    expect(parsed).toEqual({
      kind: "preset",
      preset: "last_7_days",
      query: "",
    });
    expect(analyticsPageHref(parsed)).toBe("/admin/analytics");
  });

  it("prefers a valid custom range", () => {
    const parsed = parseAnalyticsSearchParams({
      preset: "today",
      from: "2026-08-01",
      to: "2026-08-10",
    });
    expect(parsed.kind).toBe("custom");
    if (parsed.kind === "custom") {
      expect(parsed.from).toBe("2026-08-01");
      expect(parsed.to).toBe("2026-08-10");
    }
  });
});
