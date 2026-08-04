import { describe, expect, it } from "vitest";
import { shouldAutoRefineOnType } from "./navigationPolicy";

describe("shouldAutoRefineOnType", () => {
  it("refines only on the products results page", () => {
    expect(shouldAutoRefineOnType("/products")).toBe(true);
    expect(shouldAutoRefineOnType("/")).toBe(false);
    expect(shouldAutoRefineOnType("/category/sofas")).toBe(false);
    expect(shouldAutoRefineOnType("/products/slug")).toBe(false);
  });
});
