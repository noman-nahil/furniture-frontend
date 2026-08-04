import { describe, expect, it } from "vitest";
import {
  compactSearchKey,
  findFlexibleMatch,
  matchesLoosely,
  toFlexiblePattern,
} from "./flexibleMatch";

describe("flexible separator matching", () => {
  it("compacts spaces and hyphens the same way", () => {
    expect(compactSearchKey("canape 7")).toBe("canape7");
    expect(compactSearchKey("canape-7")).toBe("canape7");
    expect(compactSearchKey("canape7")).toBe("canape7");
  });

  it("builds a flexible regex pattern from spaced, hyphenated, or glued input", () => {
    expect(toFlexiblePattern("canape 7")).toBe("canape[\\s\\-_]*7");
    expect(toFlexiblePattern("canape-7")).toBe("canape[\\s\\-_]*7");
    expect(toFlexiblePattern("canape7")).toBe("canape[\\s\\-_]*7");
  });

  it("matches canape7 / canape 7 against canape-7", () => {
    expect(matchesLoosely("Canape-7", "canape 7")).toBe(true);
    expect(matchesLoosely("canape-7", "canape7")).toBe(true);
    expect(matchesLoosely("canape 7", "canape-7")).toBe(true);
    expect(matchesLoosely("Canape-7", "canape7")).toBe(true);
  });

  it("finds highlight span across separators", () => {
    const found = findFlexibleMatch("Canape-7 Sofa", "canape 7");
    expect(found).toEqual({ start: 0, length: 8 }); // "Canape-7"
  });
});
