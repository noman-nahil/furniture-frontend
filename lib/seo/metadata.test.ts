import { describe, expect, it } from "vitest";
import { buildPageMetadata, trimMetaDescription } from "./metadata";
import { DEFAULT_DESCRIPTION } from "./site";

describe("trimMetaDescription", () => {
  it("leaves short copy unchanged", () => {
    expect(trimMetaDescription("Canapés et lits.")).toBe("Canapés et lits.");
  });

  it("cuts at a word boundary without an ellipsis", () => {
    const long =
      "L’histoire de Meubles De Paris – Bangladesh Furniture : plus de 12 ans au service de Paris, mobilier importé de Turquie et d’Italie, trois magasins dont un showroom de 5 000 m² à La Courneuve.";
    const trimmed = trimMetaDescription(long);
    expect(trimmed.length).toBeLessThanOrEqual(160);
    expect(trimmed.endsWith("…")).toBe(false);
    expect(trimmed.endsWith(" ")).toBe(false);
    expect(trimmed.includes("showroom")).toBe(false);
  });
});

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

  it("does not truncate titles", () => {
    const title =
      "Chambre à Coucher MONZA Beige Ensemble Complet Avec Armoire Et Coiffeuse";
    const meta = buildPageMetadata({
      title,
      description: "Un lit confortable pour la chambre.",
      path: "/products/monza",
    });
    expect(meta.title).toBe(title);
    expect(meta.openGraph?.title).toBe(title);
  });
});
