// features/banners/utils/bannerLabel.ts
import type { Banner } from "../types";

/**
 * Title and alt are both optional, so admin UI that needs a name for a banner
 * (table rows, delete confirmations, move buttons) falls back through
 * title → alt → a short id, rather than rendering a blank.
 */
export function bannerLabel(banner: Pick<Banner, "_id" | "title" | "alt">): string {
  return banner.title.trim() || banner.alt.trim() || `Banner ${banner._id.slice(-6)}`;
}
