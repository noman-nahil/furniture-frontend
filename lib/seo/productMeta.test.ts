import { describe, expect, it } from "vitest";
import type { ProductForMeta } from "./catalog";
import {
  resolveProductJsonLdDescription,
  resolveProductMetaDescription,
  resolveProductMetaTitle,
  resolveProductPageSeo,
} from "./productMeta";

function product(overrides: Partial<ProductForMeta> = {}): ProductForMeta {
  return {
    _id: "p1",
    name: { fr: "Chambre a Coucher LE MANS" },
    slug: { fr: "chambre-a-coucher-le-mans" },
    price: 1390,
    images: ["products/le-mans.webp"],
    status: "active",
    ...overrides,
  } as ProductForMeta;
}

describe("resolveProductMetaDescription", () => {
  it("prefers an explicit seo.fr.metaDescription", () => {
    expect(
      resolveProductMetaDescription(
        "Chambre a Coucher LE MANS",
        "Lit coffre LE MANS, structure bois.",
        "Description longue visible sur la fiche.",
      ),
    ).toBe("Lit coffre LE MANS, structure bois.");
  });

  it("uses the French product description when SEO is missing", () => {
    expect(
      resolveProductMetaDescription(
        "Chambre a Coucher LE MANS",
        undefined,
        "Chambre complète en tissu beige, tête de lit comprise.",
      ),
    ).toBe("Chambre complète en tissu beige, tête de lit comprise.");
  });

  it("strips HTML from the product description", () => {
    expect(
      resolveProductMetaDescription(
        "Canapé Milano",
        "",
        "<p>Canapé 3 places&nbsp;en velours.</p>",
      ),
    ).toBe("Canapé 3 places en velours.");
  });

  it("treats an empty description as missing", () => {
    expect(
      resolveProductMetaDescription("Chambre a Coucher LE MANS", undefined, ""),
    ).toBe("Découvrez Chambre a Coucher LE MANS chez Meubles De Paris.");
  });

  it("treats an empty SEO description as missing", () => {
    expect(
      resolveProductMetaDescription("Chambre a Coucher LE MANS", "   ", "  "),
    ).toBe("Découvrez Chambre a Coucher LE MANS chez Meubles De Paris.");
  });
});

describe("resolveProductJsonLdDescription", () => {
  it("uses the visible French description when present", () => {
    expect(
      resolveProductJsonLdDescription(
        "Canapé Milano",
        "Canapé d'angle convertible.",
      ),
    ).toBe("Canapé d'angle convertible.");
  });

  it("does not invent English copy when the description is empty", () => {
    expect(resolveProductJsonLdDescription("Canapé Milano", "")).toBe(
      "Découvrez Canapé Milano chez Meubles De Paris.",
    );
    expect(resolveProductJsonLdDescription("Canapé Milano", "   ")).not.toMatch(
      /Shop /,
    );
  });
});

describe("resolveProductMetaTitle", () => {
  it("treats an empty CMS title as missing", () => {
    expect(resolveProductMetaTitle("Canapé Milano", "")).toBe("Canapé Milano");
  });
});

describe("resolveProductPageSeo", () => {
  it("marks an unknown product as missing", () => {
    expect(
      resolveProductPageSeo(null, "this-product-does-not-exist-xyz"),
    ).toEqual({ missing: true });
  });

  it("builds SEO for a valid product without inventing details", () => {
    const resolved = resolveProductPageSeo(product(), "chambre-a-coucher-le-mans");
    expect(resolved.missing).toBe(false);
    if (resolved.missing) return;
    expect(resolved.title).toBe("Chambre a Coucher LE MANS");
    expect(resolved.description).toBe(
      "Découvrez Chambre a Coucher LE MANS chez Meubles De Paris.",
    );
    expect(resolved.jsonLdDescription).toBe(resolved.description);
    expect(resolved.path).toBe("/products/chambre-a-coucher-le-mans");
    expect(resolved.noIndex).toBe(false);
  });

  it("keeps noIndex for a real product flagged in CMS", () => {
    const resolved = resolveProductPageSeo(
      product({ noIndex: true }),
      "chambre-a-coucher-le-mans",
    );
    expect(resolved.missing).toBe(false);
    if (resolved.missing) return;
    expect(resolved.noIndex).toBe(true);
  });
});
