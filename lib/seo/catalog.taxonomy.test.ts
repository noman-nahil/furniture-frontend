import { describe, expect, it } from "vitest";
import type { CategoryNav } from "@/types/categoryNav";
import {
  findCategoryInList,
  resolveSubcategoryFromList,
} from "./catalog";

const taxonomy: CategoryNav[] = [
  {
    _id: "cat-1",
    name: "Canapés",
    slug: "canape",
    image: "categories/canape.webp",
    subcategories: [
      { _id: "sub-1", name: "Canapés d'angle", slug: "canapes-angle" },
      { _id: "sub-2", name: "Canapés lits", slug: "canapes-lits" },
    ],
  },
  {
    _id: "cat-2",
    name: "Les Chambres",
    slug: "les-chambres",
    subcategories: [
      { _id: "sub-3", name: "Chambres Adulte", slug: "chambres-adulte" },
    ],
  },
  {
    _id: "cat-empty",
    name: "Tables",
    slug: "table",
    subcategories: [],
  },
];

describe("findCategoryInList", () => {
  it("returns a valid category", () => {
    const found = findCategoryInList(taxonomy, "canape");
    expect(found?.name).toBe("Canapés");
  });

  it("returns undefined for an unknown category", () => {
    expect(
      findCategoryInList(taxonomy, "this-category-does-not-exist-xyz"),
    ).toBeUndefined();
  });
});

describe("resolveSubcategoryFromList", () => {
  it("returns titles for a valid subcategory", () => {
    expect(
      resolveSubcategoryFromList(taxonomy, "les-chambres", "chambres-adulte"),
    ).toEqual({
      category: "Les Chambres",
      subcategory: "Chambres Adulte",
    });
  });

  it("matches a subcategory via slugified name", () => {
    expect(
      resolveSubcategoryFromList(taxonomy, "canape", "canapes-dangle"),
    ).toEqual({
      category: "Canapés",
      subcategory: "Canapés d'angle",
    });
  });

  it("returns null for an unknown subcategory on a valid category", () => {
    expect(
      resolveSubcategoryFromList(taxonomy, "canape", "does-not-exist"),
    ).toBeNull();
  });

  it("returns null for an unknown category", () => {
    expect(
      resolveSubcategoryFromList(
        taxonomy,
        "missing-category",
        "chambres-adulte",
      ),
    ).toBeNull();
  });

  it("does not invent a title for an empty valid category with a fake sub slug", () => {
    expect(resolveSubcategoryFromList(taxonomy, "table", "invented")).toBeNull();
  });
});
