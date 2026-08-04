import { describe, expect, it } from "vitest";
import {
  buildSearchResultsHref,
  clampSearchInput,
  isSearchableQuery,
  normalizeSearch,
} from "./normalize";

describe("normalizeSearch", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeSearch("  oak   table  ")).toBe("oak table");
  });

  it("caps length at MAX_SEARCH_LENGTH", () => {
    const long = "a".repeat(250);
    expect(normalizeSearch(long).length).toBe(200);
  });

  it("handles non-strings", () => {
    expect(normalizeSearch(null)).toBe("");
    expect(normalizeSearch(undefined)).toBe("");
    expect(normalizeSearch(12)).toBe("");
  });
});

describe("isSearchableQuery", () => {
  it("rejects empty and single-character queries", () => {
    expect(isSearchableQuery("")).toBe(false);
    expect(isSearchableQuery("a")).toBe(false);
    expect(isSearchableQuery("ab")).toBe(true);
  });
});

describe("clampSearchInput", () => {
  it("does not trim while typing", () => {
    expect(clampSearchInput(" sofa ")).toBe(" sofa ");
  });
});

describe("buildSearchResultsHref", () => {
  it("builds encoded search URLs", () => {
    expect(buildSearchResultsHref("")).toBe("/products");
    expect(buildSearchResultsHref("oak chair")).toBe(
      "/products?search=oak%20chair",
    );
  });
});
