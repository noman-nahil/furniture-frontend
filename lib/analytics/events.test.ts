import { describe, expect, it } from "vitest";
import { pushDataLayer } from "./dataLayer";
import {
  buildAddToCartEvent,
  buildBeginCheckoutEvent,
  buildPageViewEvent,
  buildPurchaseEvent,
  buildSearchEvent,
  buildViewItemEvent,
  trackPurchase,
  trackSearch,
} from "./events";

describe("event builders", () => {
  it("builds page_view", () => {
    expect(buildPageViewEvent("/products", "https://example.test/products", "Shop")).toEqual({
      event: "page_view",
      page_path: "/products",
      page_location: "https://example.test/products",
      page_title: "Shop",
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
  });

  it("builds begin_checkout and purchase", () => {
    const items = [
      { itemId: "a", itemName: "Lit", price: 649, quantity: 1 },
    ];
    expect(buildBeginCheckoutEvent({ value: 649, items, currency: "EUR" }).event).toBe(
      "begin_checkout",
    );
    const purchase = buildPurchaseEvent({
      transactionId: "tok-1",
      value: 649,
      items,
      currency: "EUR",
    });
    expect(purchase.event).toBe("purchase");
    expect(purchase.transaction_id).toBe("tok-1");
  });

  it("builds search with the committed term", () => {
    expect(buildSearchEvent("canapé")).toEqual({
      event: "search",
      search_term: "canapé",
    });
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
