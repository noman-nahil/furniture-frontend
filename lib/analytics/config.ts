const GTM_ID_RE = /^GTM-[A-Z0-9]+$/i;
const META_PIXEL_ID_RE = /^\d{5,20}$/;

/** Only production Meta Pixel / Dataset. Never send events elsewhere. */
export const PRODUCTION_META_PIXEL_ID = "253140121215662";

export function getGtmId(): string | null {
  const raw = process.env.NEXT_PUBLIC_GTM_ID?.trim() ?? "";
  return GTM_ID_RE.test(raw) ? raw : null;
}

export function getMetaPixelId(): string | null {
  const raw = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
  if (!META_PIXEL_ID_RE.test(raw)) return null;
  if (process.env.NODE_ENV === "production" && raw !== PRODUCTION_META_PIXEL_ID) {
    return PRODUCTION_META_PIXEL_ID;
  }
  return raw;
}
