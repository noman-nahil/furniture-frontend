import { afterEach, describe, expect, it } from "vitest";
import { socialImageUrl } from "./site";

const ORIGINAL_SITE = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_SITE;
});

describe("socialImageUrl", () => {
  it("uses a .jpg path so WhatsApp treats the proxy as an image", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://meublesdeparis.com";
    const url = socialImageUrl("products/2026/09/02/photo.png");
    expect(url).toBe(
      "https://meublesdeparis.com/og/image.jpg?src=products%2F2026%2F09%2F02%2Fphoto.png",
    );
  });

  it("does not nest an already-proxied URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://meublesdeparis.com";
    const existing =
      "https://meublesdeparis.com/og/image.jpg?src=products%2Fphoto.webp";
    expect(socialImageUrl(existing)).toBe(existing);
  });
});
