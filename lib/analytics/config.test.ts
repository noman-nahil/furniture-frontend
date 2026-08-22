import { afterEach, describe, expect, it } from "vitest";
import { getGtmId, getMetaPixelId } from "./config";

const ORIGINAL_GTM = process.env.NEXT_PUBLIC_GTM_ID;
const ORIGINAL_PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;

afterEach(() => {
  process.env.NEXT_PUBLIC_GTM_ID = ORIGINAL_GTM;
  process.env.NEXT_PUBLIC_META_PIXEL_ID = ORIGINAL_PIXEL;
});

describe("getGtmId", () => {
  it("accepts a GTM container id", () => {
    process.env.NEXT_PUBLIC_GTM_ID = "GTM-K2WMJ2CX";
    expect(getGtmId()).toBe("GTM-K2WMJ2CX");
  });

  it("rejects empty or malformed values", () => {
    process.env.NEXT_PUBLIC_GTM_ID = "";
    expect(getGtmId()).toBeNull();
    process.env.NEXT_PUBLIC_GTM_ID = "UA-123";
    expect(getGtmId()).toBeNull();
  });
});

describe("getMetaPixelId", () => {
  it("accepts a numeric pixel id", () => {
    process.env.NEXT_PUBLIC_META_PIXEL_ID = "123456789012345";
    expect(getMetaPixelId()).toBe("123456789012345");
  });

  it("rejects empty or non-numeric values", () => {
    process.env.NEXT_PUBLIC_META_PIXEL_ID = "";
    expect(getMetaPixelId()).toBeNull();
    process.env.NEXT_PUBLIC_META_PIXEL_ID = "not-a-pixel";
    expect(getMetaPixelId()).toBeNull();
  });
});
