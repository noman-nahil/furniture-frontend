import { PRODUCTION_SITE_URL } from "../config";

/** Production www host that must 301 to the apex canonical origin. */
export const WWW_HOST = "www.meublesdeparis.com";

/**
 * Host-based www → apex redirects for next.config.
 * Query strings are forwarded by Next.js automatically.
 * Placed first so /shop and other path rules run on the apex host.
 */
export function wwwToApexRedirects() {
  const apex = PRODUCTION_SITE_URL.replace(/\/$/, "");

  return [
    {
      source: "/",
      has: [{ type: "host" as const, value: WWW_HOST }],
      destination: `${apex}/`,
      statusCode: 301 as const,
    },
    {
      source: "/:path*",
      has: [{ type: "host" as const, value: WWW_HOST }],
      destination: `${apex}/:path*`,
      statusCode: 301 as const,
    },
  ];
}
