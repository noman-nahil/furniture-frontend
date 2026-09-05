import { APP_NAME, PRODUCTION_SITE_URL } from "@/lib/config";
import { getImageUrl } from "@/lib/image";

export { PRODUCTION_SITE_URL };

export const SITE_NAME = APP_NAME;

export const DEFAULT_TITLE = `${APP_NAME} — Premium Furniture & Home Décor`;

export const DEFAULT_DESCRIPTION =
  "Premium furniture and home décor. Discover curated pieces crafted for lasting elegance at Meubles De Paris.";

/** Local fallback social image (1200×630-friendly hero). Always absolute via metadataBase / absoluteUrl. */
export const DEFAULT_OG_IMAGE_PATH = "/og-default.jpg";

export const DEFAULT_OG_IMAGE = {
  url: DEFAULT_OG_IMAGE_PATH,
  width: 1200,
  height: 630,
  alt: `${APP_NAME} — Premium furniture and home décor`,
} as const;

export const SITE_KEYWORDS = [
  "furniture",
  "home décor",
  "premium furniture",
  "sofa",
  "living room",
  "bedroom",
  "Meubles De Paris",
  APP_NAME,
] as const;

function withHttps(hostOrUrl: string): string {
  return hostOrUrl.startsWith("http") ? hostOrUrl : `https://${hostOrUrl}`;
}

/**
 * Resolves the canonical site origin.
 * Prefer NEXT_PUBLIC_SITE_URL in every deployed environment.
 * Never prefer ephemeral Vercel deployment hostnames for production —
 * WhatsApp / Facebook use og:url and a mismatched host breaks previews.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const vercelEnv = process.env.VERCEL_ENV?.trim();
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim().replace(
    /\/$/,
    "",
  );
  if (vercelEnv === "production" && vercelProd) {
    return withHttps(vercelProd);
  }

  // Stable production fallback before ephemeral *.vercel.app deployment URLs
  if (vercelEnv === "production" || process.env.NODE_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  const vercel = process.env.VERCEL_URL?.trim().replace(/\/$/, "");
  if (vercel) {
    return withHttps(vercel);
  }

  return "http://localhost:3000";
}

/** Join a path or absolute URL onto the site origin. */
export function absoluteUrl(pathOrUrl: string = "/"): string {
  if (!pathOrUrl) return getSiteUrl();
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = getSiteUrl();
  return `${base}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

/**
 * Absolute image URL for Open Graph / Twitter / JSON-LD.
 * Handles R2 keys, absolute remotes, and site-relative paths.
 */
export function absoluteImageUrl(
  image?: string | null,
  fallback: string = DEFAULT_OG_IMAGE_PATH,
): string {
  const resolved = image ? getImageUrl(image) : fallback;
  if (/^https?:\/\//i.test(resolved)) return resolved;
  // getImageUrl may return a local placeholder when image is empty
  if (!image && resolved.startsWith("/images/")) {
    return absoluteUrl(fallback);
  }
  return absoluteUrl(resolved.startsWith("/") ? resolved : `/${resolved}`);
}

/**
 * Messenger-safe OG image URL (WhatsApp / Facebook / iMessage).
 * Product gallery files are WebP on R2; those clients often omit the
 * thumbnail entirely. Proxy through `/og/image.jpg` to serve a resized JPEG.
 */
export function socialImageUrl(
  image?: string | null,
  fallback: string = DEFAULT_OG_IMAGE_PATH,
): string {
  const raw = (image ?? "").trim();
  const src = raw || fallback;

  // Already pointing at our JPEG proxy — don't nest.
  if (src.includes("/og/image")) {
    return /^https?:\/\//i.test(src) ? src : absoluteUrl(src);
  }

  // Path must end in `.jpg` *before* the query string. WhatsApp often
  // skips `/og/image?src=…` even when the response is a valid JPEG.
  return absoluteUrl(`/og/image.jpg?src=${encodeURIComponent(src)}`);
}
