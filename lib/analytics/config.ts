const GTM_ID_RE = /^GTM-[A-Z0-9]+$/i;
const META_PIXEL_ID_RE = /^\d{5,20}$/;

export function getGtmId(): string | null {
  const raw = process.env.NEXT_PUBLIC_GTM_ID?.trim() ?? "";
  return GTM_ID_RE.test(raw) ? raw : null;
}

export function getMetaPixelId(): string | null {
  const raw = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
  return META_PIXEL_ID_RE.test(raw) ? raw : null;
}
