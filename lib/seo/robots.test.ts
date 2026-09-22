import { describe, expect, it } from "vitest";
import robots from "@/app/robots";

describe("robots", () => {
  it("disallows account and staff surfaces", () => {
    const rules = robots();
    const disallow = rules.rules[0]?.disallow ?? [];
    expect(disallow).toEqual(
      expect.arrayContaining([
        "/admin",
        "/dashboard",
        "/account",
        "/account/",
      ]),
    );
  });
});
