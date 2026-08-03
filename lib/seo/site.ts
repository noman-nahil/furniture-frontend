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

/**
 * Resolves the canonical site origin.
 * Prefer NEXT_PUBLIC_SITE_URL in every deployed environment.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const vercel = process.env.VERCEL_URL?.trim().replace(/\/$/, "");
  if (vercel) {
    return vercel.startsWith("http") ? vercel : `https://${vercel}`;
  }

  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_SITE_URL;
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
