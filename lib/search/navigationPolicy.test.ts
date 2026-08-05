import { describe, expect, it } from "vitest";
import {
  shouldAutoRefineOnType,
  shouldKeepSearchQuery,
} from "./navigationPolicy";

describe("shouldAutoRefineOnType", () => {
  it("refines only on the products results page", () => {
    expect(shouldAutoRefineOnType("/products")).toBe(true);
    expect(shouldAutoRefineOnType("/")).toBe(false);
    expect(shouldAutoRefineOnType("/category/sofas")).toBe(false);
    expect(shouldAutoRefineOnType("/products/slug")).toBe(false);
  });
});

describe("shouldKeepSearchQuery", () => {
  it("keeps query on results and product detail", () => {
    expect(shouldKeepSearchQuery("/products")).toBe(true);
    expect(shouldKeepSearchQuery("/products/canape-7")).toBe(true);
  });

  it("clears query on category / home / other routes", () => {
    expect(shouldKeepSearchQuery("/")).toBe(false);
    expect(shouldKeepSearchQuery("/categories")).toBe(false);
    expect(shouldKeepSearchQuery("/category/table")).toBe(false);
    expect(shouldKeepSearchQuery("/category/table/table-manger")).toBe(false);
    expect(shouldKeepSearchQuery("/cart")).toBe(false);
  });
});
