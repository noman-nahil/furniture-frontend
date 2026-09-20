import { describe, expect, it } from "vitest";
import {
  classifyCatalogFetchFailure,
  shouldLookupProductById,
} from "./catalog";

describe("classifyCatalogFetchFailure", () => {
  it("treats HTTP 404 as a real miss", () => {
    expect(classifyCatalogFetchFailure({ status: 404 })).toBe("missing");
  });

  it("treats timeouts, 5xx, and other failures as unavailable", () => {
    expect(classifyCatalogFetchFailure({})).toBe("unavailable");
    expect(classifyCatalogFetchFailure({ status: 500 })).toBe("unavailable");
    expect(classifyCatalogFetchFailure({ status: 503 })).toBe("unavailable");
    expect(classifyCatalogFetchFailure({ status: 429 })).toBe("unavailable");
    expect(classifyCatalogFetchFailure({ status: 400 })).toBe("unavailable");
  });
});

describe("shouldLookupProductById", () => {
  it("accepts a 24-char hex ObjectId only", () => {
    expect(shouldLookupProductById("64f1c2a3b4d5e6f789012345")).toBe(true);
    expect(shouldLookupProductById("does-not-exist")).toBe(false);
    expect(shouldLookupProductById("canape-milano")).toBe(false);
    expect(shouldLookupProductById("living-room1")).toBe(false);
  });
});
