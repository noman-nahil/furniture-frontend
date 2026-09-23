import { describe, expect, it } from "vitest";
import { isStorefrontWhatsAppPath } from "./storefrontWhatsApp";

describe("isStorefrontWhatsAppPath", () => {
  it("shows on public storefront pages", () => {
    expect(isStorefrontWhatsAppPath("/")).toBe(true);
    expect(isStorefrontWhatsAppPath("/about")).toBe(true);
    expect(isStorefrontWhatsAppPath("/contact")).toBe(true);
    expect(isStorefrontWhatsAppPath("/products")).toBe(true);
    expect(isStorefrontWhatsAppPath("/products/canape-angle")).toBe(true);
    expect(isStorefrontWhatsAppPath("/shop")).toBe(true);
    expect(isStorefrontWhatsAppPath("/categories")).toBe(true);
    expect(isStorefrontWhatsAppPath("/category/salon")).toBe(true);
    expect(isStorefrontWhatsAppPath("/order-tracking")).toBe(true);
  });

  it("hides on cart, checkout, auth, and staff pages", () => {
    expect(isStorefrontWhatsAppPath("/cart")).toBe(false);
    expect(isStorefrontWhatsAppPath("/cart/")).toBe(false);
    expect(isStorefrontWhatsAppPath("/checkout")).toBe(false);
    expect(isStorefrontWhatsAppPath("/checkout/confirmation")).toBe(false);
    expect(isStorefrontWhatsAppPath("/login")).toBe(false);
    expect(isStorefrontWhatsAppPath("/register")).toBe(false);
    expect(isStorefrontWhatsAppPath("/dashboard")).toBe(false);
    expect(isStorefrontWhatsAppPath("/dashboard/orders")).toBe(false);
    expect(isStorefrontWhatsAppPath("/admin")).toBe(false);
    expect(isStorefrontWhatsAppPath("/admin/products")).toBe(false);
    expect(isStorefrontWhatsAppPath("/manager")).toBe(false);
    expect(isStorefrontWhatsAppPath("/manager/orders")).toBe(false);
    expect(isStorefrontWhatsAppPath("/maintenance")).toBe(false);
  });

  it("does not treat similar prefixes as excluded", () => {
    expect(isStorefrontWhatsAppPath("/cartoon")).toBe(true);
    expect(isStorefrontWhatsAppPath("/admin-help")).toBe(true);
  });
});
