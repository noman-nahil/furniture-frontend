import type { NextConfig } from "next";
import { wwwToApexRedirects } from "./lib/seo/wwwRedirect";

// Read from .env — NOT hardcoded — so dev/staging/production can each point
// at a different R2 bucket without touching this file or redeploying config.
// Make sure NEXT_PUBLIC_R2_PUBLIC_URL is set in .env.local (and in your
// hosting platform's env vars for prod) — this runs at build time, so a
// missing value here means no R2 pattern gets registered at all.
const r2Hostname = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
  ? new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL).hostname
  : undefined;

if (!r2Hostname && process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-console
  console.warn(
    "[next.config] NEXT_PUBLIC_R2_PUBLIC_URL is not set — R2-hosted images will fail to load via next/image."
  );
}

const nextConfig: NextConfig = {
  // Keep OG tags in <head> for WhatsApp / Facebook / Slack (they do not
  // execute JS and stop reading if metadata streams into <body>).
  htmlLimitedBots: /WhatsApp|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Pinterest|SkypeUriPreview/i,
  async rewrites() {
    return [
      {
        source: "/og/image.jpg",
        destination: "/og/image",
      },
    ];
  },
  async redirects() {
    return [
      // www → apex first so path rules like /shop run on the canonical host.
      ...wwwToApexRedirects(),
      {
        source: "/sitemap_index.xml",
        destination: "/sitemap.xml",
        permanent: true,
      },
      {
        source: "/shop",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/shop/:path*",
        destination: "/products",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      ...(r2Hostname
        ? [
            {
              protocol: "https" as const,
              hostname: r2Hostname,
            },
          ]
        : []),
      // ibb.co — third-party host, fixed domain, not environment-specific,
      // so hardcoding here (rather than an env var) is the right call.
      {
        protocol: "https",
        hostname: "i.ibb.co.com",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
    ],
  },
};

export default nextConfig;