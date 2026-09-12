import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  HOME_H1,
  productFallbackDescription,
  SITE_KEYWORDS,
  socialImageUrl,
  usableSeoText,
} from "./site";

const ORIGINAL_SITE = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_SITE;
});

describe("socialImageUrl", () => {
  it("uses a .jpg path so WhatsApp treats the proxy as an image", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://meublesdeparis.com";
    const url = socialImageUrl("products/2026/09/02/photo.png");
    expect(url).toBe(
      "https://meublesdeparis.com/og/image.jpg?src=products%2F2026%2F09%2F02%2Fphoto.png",
    );
  });

  it("does not nest an already-proxied URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://meublesdeparis.com";
    const existing =
      "https://meublesdeparis.com/og/image.jpg?src=products%2Fphoto.webp";
    expect(socialImageUrl(existing)).toBe(existing);
  });
});

describe("French default SEO copy", () => {
  it("uses French commercial defaults, not English furniture copy", () => {
    expect(DEFAULT_TITLE).toContain("Meubles De Paris");
    expect(DEFAULT_TITLE).toMatch(/Canapés|meubles|mobilier/i);
    expect(DEFAULT_TITLE).not.toMatch(/Premium Furniture/i);
    expect(DEFAULT_DESCRIPTION).toMatch(/meubles|mobilier|décoration/i);
    expect(DEFAULT_DESCRIPTION).not.toMatch(/Premium furniture/i);
    expect(SITE_KEYWORDS).toContain("meubles");
    expect(SITE_KEYWORDS).not.toContain("furniture");
  });

  it("treats empty CMS strings as missing", () => {
    expect(usableSeoText("")).toBeUndefined();
    expect(usableSeoText("   ")).toBeUndefined();
    expect(usableSeoText(null)).toBeUndefined();
    expect(usableSeoText("Canapé Milano")).toBe("Canapé Milano");
  });

  it("builds a name-only French product fallback", () => {
    expect(productFallbackDescription("Canapé Milano")).toBe(
      "Découvrez Canapé Milano chez Meubles De Paris.",
    );
  });
});

describe("homepage H1", () => {
  it("defines one French commercial heading used exactly once on the homepage", () => {
    expect(HOME_H1).toContain("Meubles De Paris");
    expect(HOME_H1).toMatch(/Canapés|lits|meubles/i);

    const homepage = readFileSync(
      path.resolve(__dirname, "../../app/(public)/page.tsx"),
      "utf8",
    );
    expect(homepage.match(/<h1\b/g)).toHaveLength(1);
    expect(homepage).toContain("{HOME_H1}");
  });
});
