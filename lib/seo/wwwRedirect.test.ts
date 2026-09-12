import { describe, expect, it } from "vitest";
import { PRODUCTION_SITE_URL } from "@/lib/config";
import { WWW_HOST, wwwToApexRedirects } from "./wwwRedirect";

describe("wwwToApexRedirects", () => {
  const rules = wwwToApexRedirects();
  const apex = PRODUCTION_SITE_URL.replace(/\/$/, "");

  it("301s the www homepage to the apex origin", () => {
    const home = rules.find((rule) => rule.source === "/");
    expect(home).toMatchObject({
      destination: `${apex}/`,
      statusCode: 301,
      has: [{ type: "host", value: WWW_HOST }],
    });
  });

  it("preserves path segments on www → apex", () => {
    const pathRule = rules.find((rule) => rule.source === "/:path*");
    expect(pathRule).toMatchObject({
      destination: `${apex}/:path*`,
      statusCode: 301,
      has: [{ type: "host", value: WWW_HOST }],
    });
  });
});

describe("next.config redirects", () => {
  it("applies www → apex before /shop and sitemap aliases", async () => {
    const { default: nextConfig } = await import("../../next.config");
    const redirects = await nextConfig.redirects!();
    const sources = redirects.map((rule) => rule.source);

    expect(sources[0]).toBe("/");
    expect(sources[1]).toBe("/:path*");
    expect(sources).toContain("/shop");
    expect(sources).toContain("/shop/:path*");
    expect(sources).toContain("/sitemap_index.xml");

    const wwwPath = redirects.find((rule) => rule.source === "/:path*");
    expect(wwwPath).toMatchObject({
      statusCode: 301,
      destination: "https://meublesdeparis.com/:path*",
    });
  });
});
