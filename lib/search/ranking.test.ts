import { describe, expect, it } from "vitest";
import { scoreSuggestion, sortByRelevance, splitHighlight } from "./ranking";

describe("scoreSuggestion", () => {
  it("ranks exact name above partial", () => {
    const exact = scoreSuggestion(
      { kind: "product", label: "Sofa" },
      "sofa",
    );
    const partial = scoreSuggestion(
      { kind: "product", label: "Sofa Bed" },
      "sofa",
    );
    expect(exact).toBeGreaterThan(partial);
  });

  it("ranks SKU/MPN exact highest", () => {
    const sku = scoreSuggestion(
      { kind: "product", label: "Chair", skuHints: ["ABC-1"] },
      "ABC-1",
    );
    const name = scoreSuggestion(
      { kind: "product", label: "ABC-1" },
      "ABC-1",
    );
    expect(sku).toBeGreaterThanOrEqual(name);
  });

  it("ranks starts-with above contains", () => {
    const starts = scoreSuggestion(
      { kind: "product", label: "Oak table" },
      "oak",
    );
    const contains = scoreSuggestion(
      { kind: "product", label: "Table oak finish" },
      "oak",
    );
    expect(starts).toBeGreaterThan(contains);
  });
});

describe("sortByRelevance", () => {
  it("orders products before weaker category partials when labels tie on tier", () => {
    const sorted = sortByRelevance(
      [
        { kind: "category" as const, label: "Sofas" },
        { kind: "product" as const, label: "Sofa" },
      ],
      "sofa",
    );
    expect(sorted[0].kind).toBe("product");
  });
});

describe("splitHighlight", () => {
  it("marks the matched span", () => {
    const parts = splitHighlight("Oak Chair", "oak");
    expect(parts).toEqual([
      { text: "Oak", match: true },
      { text: " Chair", match: false },
    ]);
  });

  it("highlights across hyphen/space variants", () => {
    const parts = splitHighlight("Canape-7", "canape 7");
    expect(parts).toEqual([{ text: "Canape-7", match: true }]);
  });

  it("returns full text when no match", () => {
    expect(splitHighlight("Lamp", "sofa")).toEqual([
      { text: "Lamp", match: false },
    ]);
  });
});

describe("separator-insensitive scoring", () => {
  it("scores canape 7 / canape7 against canape-7 as a strong match", () => {
    expect(
      scoreSuggestion({ kind: "product", label: "Canape-7" }, "canape 7"),
    ).toBeGreaterThanOrEqual(500);
    expect(
      scoreSuggestion({ kind: "product", label: "Canape-7" }, "canape7"),
    ).toBeGreaterThanOrEqual(500);
  });
});
