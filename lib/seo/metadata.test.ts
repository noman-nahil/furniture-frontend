import { describe, expect, it } from "vitest";
import { buildPageMetadata } from "./metadata";
import { DEFAULT_DESCRIPTION } from "./site";

describe("buildPageMetadata", () => {
  it("replaces an empty description with the French default", () => {
    const meta = buildPageMetadata({
      title: "Canapés",
      description: "   ",
      path: "/category/canape",
    });
    expect(meta.description).toBe(DEFAULT_DESCRIPTION);
    expect(meta.openGraph?.description).toBe(DEFAULT_DESCRIPTION);
  });
});
