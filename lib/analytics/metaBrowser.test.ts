import { afterEach, describe, expect, it, vi } from "vitest";
import { createAnalyticsEventId, readMetaClickIds } from "./metaBrowser";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createAnalyticsEventId", () => {
  it("returns a non-empty id", () => {
    const id = createAnalyticsEventId();
    expect(id.length).toBeGreaterThan(8);
  });
});

describe("readMetaClickIds", () => {
  it("reads _fbp and _fbc cookies", () => {
    vi.stubGlobal("document", {
      cookie: "_fbp=fb.1.1710000000.123456; _fbc=fb.1.1710000000.IwAR0click",
    });
    vi.stubGlobal("window", {
      location: { href: "https://meublesdeparis.com/" },
    });

    expect(readMetaClickIds()).toEqual({
      fbp: "fb.1.1710000000.123456",
      fbc: "fb.1.1710000000.IwAR0click",
    });
  });

  it("builds fbc from fbclid when the cookie is missing", () => {
    vi.stubGlobal("document", { cookie: "_fbp=fb.1.1710000000.999" });
    vi.stubGlobal("window", {
      location: {
        href: "https://meublesdeparis.com/products/canape?fbclid=IwAR0test",
      },
    });

    const ids = readMetaClickIds();
    expect(ids.fbp).toBe("fb.1.1710000000.999");
    expect(ids.fbc).toMatch(/^fb\.1\.\d+\.IwAR0test$/);
  });

  it("drops invalid cookies and does not invent fbp", () => {
    vi.stubGlobal("document", { cookie: "_fbp=not-a-pixel-cookie; _fbc=also-bad" });
    vi.stubGlobal("window", {
      location: { href: "https://meublesdeparis.com/" },
    });
    expect(readMetaClickIds()).toEqual({ fbp: undefined });
  });

  it("ignores a malformed fbclid", () => {
    vi.stubGlobal("document", { cookie: "" });
    vi.stubGlobal("window", {
      location: { href: "https://meublesdeparis.com/?fbclid=bad value" },
    });
    expect(readMetaClickIds()).toEqual({ fbp: undefined });
  });
});
