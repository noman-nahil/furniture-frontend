import { describe, expect, it } from "vitest";
import { isStaffPath } from "./routes";

describe("isStaffPath", () => {
  it("skips admin and manager consoles", () => {
    expect(isStaffPath("/admin")).toBe(true);
    expect(isStaffPath("/admin/orders")).toBe(true);
    expect(isStaffPath("/manager")).toBe(true);
    expect(isStaffPath("/manager/orders")).toBe(true);
  });

  it("does not skip the storefront or customer dashboard", () => {
    expect(isStaffPath("/")).toBe(false);
    expect(isStaffPath("/products")).toBe(false);
    expect(isStaffPath("/checkout")).toBe(false);
    expect(isStaffPath("/dashboard")).toBe(false);
    expect(isStaffPath("/login")).toBe(false);
  });
});
