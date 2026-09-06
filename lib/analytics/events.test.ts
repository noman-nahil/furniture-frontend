import { afterEach, describe, expect, it, vi } from "vitest";
import { CONSENT_COOKIE_NAME } from "@/lib/consent/types";
import { getMetaCapiContext } from "./metaBrowser";
import { pushDataLayer } from "./dataLayer";
import {
  buildAddToCartEvent,
  buildBeginCheckoutEvent,
  buildPageViewEvent,
  buildPurchaseEvent,
  buildSearchEvent,
  buildSubscribedButtonClickEvent,
  buildViewItemEvent,
  META_CONSENT_GRANTED_EVENT,
  publishMetaPixelId,
  trackPurchase,
  trackSearch,
} from "./events";

function consentCookie(marketing: boolean): string {
  return `${CONSENT_COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify({
      v: 1,
      analytics: true,
      marketing,
      ts: Date.now(),
    }),
  )}`;
}

describe("event builders", () => {
  it("builds page_view", () => {
    expect(
      buildPageViewEvent(
        "/products",
        "https://example.test/products",
        "Shop",
        "evt-page",
      ),
    ).toEqual({
      event: "page_view",
      page_path: "/products",
      page_location: "https://example.test/products",
      page_title: "Shop",
      event_id: "evt-page",
      meta_event: "PageView",
    });
  });

  it("builds view_item from existing product fields", () => {
    const event = buildViewItemEvent({
      itemId: "abc",
      itemName: "Canapé",
      price: 2590,
      currency: "EUR",
    });
    expect(event.event).toBe("view_item");
    expect(event.currency).toBe("EUR");
    expect(event.value).toBe(2590);
    expect(event.content_ids).toEqual(["abc"]);
    expect(typeof event.event_id).toBe("string");
    expect(event.meta_event).toBe("ViewContent");
  });

  it("builds add_to_cart with quantity", () => {
    const event = buildAddToCartEvent({
      itemId: "abc",
      itemName: "Canapé",
      price: 100,
      quantity: 2,
      currency: "EUR",
    });
    expect(event.event).toBe("add_to_cart");
    expect(event.value).toBe(200);
    expect(event.meta_event).toBe("AddToCart");
  });

  it("builds begin_checkout and purchase", () => {
    const items = [
      { itemId: "a", itemName: "Lit", price: 649, quantity: 1 },
    ];
    expect(buildBeginCheckoutEvent({ value: 649, items, currency: "EUR" }).event).toBe(
      "begin_checkout",
    );
    expect(buildBeginCheckoutEvent({ value: 649, items, currency: "EUR" }).meta_event).toBe(
      "InitiateCheckout",
    );
    const purchase = buildPurchaseEvent({
      transactionId: "tok-1",
      value: 649,
      items,
      currency: "EUR",
      eventId: "evt-purchase",
    });
    expect(purchase.event).toBe("purchase");
    expect(purchase.transaction_id).toBe("tok-1");
    expect(purchase.event_id).toBe("evt-purchase");
    expect(purchase.meta_event).toBe("Purchase");
  });

  it("builds SubscribedButtonClick with a shared event_id and no email", () => {
    const event = buildSubscribedButtonClickEvent({ eventId: "evt-sub" });
    expect(event).toEqual({
      event: "SubscribedButtonClick",
      event_id: "evt-sub",
      meta_event: "SubscribedButtonClick",
    });
    expect(event).not.toHaveProperty("email");
    expect(event).not.toHaveProperty("em");
    expect(event).not.toHaveProperty("user_data");
  });

  it("builds search with the committed term", () => {
    const event = buildSearchEvent("canapé");
    expect(event.event).toBe("search");
    expect(event.search_term).toBe("canapé");
    expect(typeof event.event_id).toBe("string");
    expect(event.meta_event).toBe("Search");
  });
});

describe("track helpers without a browser", () => {
  it("pushDataLayer and marketing trackers do not throw on the server", () => {
    expect(() => pushDataLayer({ event: "page_view" })).not.toThrow();
    expect(() => trackSearch("canapé")).not.toThrow();
    expect(() =>
      trackPurchase({
        transactionId: "tok",
        value: 10,
        items: [{ itemId: "a", itemName: "x", price: 10, quantity: 1 }],
      }),
    ).not.toThrow();
  });
});

describe("consent and event_id", () => {
  const originalPixel = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  afterEach(() => {
    process.env.NEXT_PUBLIC_META_PIXEL_ID = originalPixel;
    vi.unstubAllGlobals();
  });

  it("does not publish the Pixel ID or CAPI context without marketing consent", () => {
    const dataLayer: Record<string, unknown>[] = [];
    vi.stubGlobal("document", { cookie: consentCookie(false) });
    vi.stubGlobal("window", {
      location: { href: "https://meublesdeparis.com/contact" },
      dataLayer,
    });

    publishMetaPixelId();
    expect(dataLayer).toEqual([]);
    expect(getMetaCapiContext()).toBeNull();
    expect(() => trackSearch("canapé")).not.toThrow();
    expect(dataLayer).toEqual([]);
    expect(dataLayer.some((entry) => entry.event === META_CONSENT_GRANTED_EVENT)).toBe(
      false,
    );
  });

  it("publishes Pixel ID and a unique CAPI event_id after marketing consent", () => {
    const dataLayer: Record<string, unknown>[] = [];
    process.env.NEXT_PUBLIC_META_PIXEL_ID = "253140121215662";
    vi.stubGlobal("document", {
      cookie: `${consentCookie(true)}; _fbp=fb.1.1710000000.123456`,
    });
    vi.stubGlobal("window", {
      location: { href: "https://meublesdeparis.com/checkout" },
      dataLayer,
    });

    publishMetaPixelId();
    expect(dataLayer[0]).toEqual({ meta_pixel_id: "253140121215662" });
    expect(dataLayer[1]).toEqual({
      event: META_CONSENT_GRANTED_EVENT,
      meta_pixel_id: "253140121215662",
    });
    publishMetaPixelId();
    expect(
      dataLayer.filter((entry) => entry.event === META_CONSENT_GRANTED_EVENT),
    ).toHaveLength(1);

    const first = getMetaCapiContext();
    const second = getMetaCapiContext();
    expect(first?.event_id).toBeTruthy();
    expect(second?.event_id).toBeTruthy();
    expect(first?.event_id).not.toBe(second?.event_id);
    expect(first?.fbp).toBe("fb.1.1710000000.123456");
  });

  it("keeps the same Purchase event_id for browser and server payloads", () => {
    const eventId = "purchase-shared-id";
    const browser = buildPurchaseEvent({
      transactionId: "tok-order-a",
      value: 100,
      eventId,
      items: [{ itemId: "a", itemName: "x", price: 100, quantity: 1 }],
    });
    expect(browser.event_id).toBe(eventId);
    expect(browser.meta_event).toBe("Purchase");
    expect(browser.event).toBe("purchase");
  });
});
