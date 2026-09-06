import { CURRENCY_CODE } from "@/lib/config";
import { readStoredConsent } from "@/lib/consent/storage";
import { createAnalyticsEventId } from "./metaBrowser";
import { getMetaPixelId } from "./config";
import { pushDataLayer, type DataLayerEntry } from "./dataLayer";

export type AnalyticsItem = {
  itemId: string;
  itemName: string;
  price: number;
  quantity: number;
};

export type ViewItemPayload = {
  itemId: string;
  itemName: string;
  price: number;
  currency?: string;
};

export type AddToCartPayload = AnalyticsItem & {
  currency?: string;
};

export type BeginCheckoutPayload = {
  value: number;
  currency?: string;
  items: AnalyticsItem[];
};

export type PurchasePayload = {
  transactionId: string;
  value: number;
  currency?: string;
  items: AnalyticsItem[];
  eventId?: string;
};

export type SubscribedButtonClickPayload = {
  eventId?: string;
};

const PURCHASE_DEDUP_PREFIX = "mdp-purchase:";
const BEGIN_CHECKOUT_DEDUP_KEY = "mdp-begin-checkout";

function canTrackMarketing(): boolean {
  return readStoredConsent()?.marketing === true;
}

function toEcommerceItem(item: AnalyticsItem) {
  return {
    item_id: item.itemId,
    item_name: item.itemName,
    price: item.price,
    quantity: item.quantity,
  };
}

function readSessionKey(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSessionKey(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Private mode / blocked storage — skip dedupe rather than throw.
  }
}

const META_EVENT_NAMES: Record<string, string> = {
  page_view: "PageView",
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
  search: "Search",
  SubscribedButtonClick: "SubscribedButtonClick",
};

function withEventId(entry: DataLayerEntry, eventId?: string): DataLayerEntry {
  const eventName = typeof entry.event === "string" ? entry.event : "";
  return {
    ...entry,
    event_id: eventId || createAnalyticsEventId(),
    meta_event: META_EVENT_NAMES[eventName] || eventName,
  };
}

function pushMarketingEvent(entry: DataLayerEntry): void {
  if (!canTrackMarketing()) return;
  pushDataLayer(entry);
}

export const META_CONSENT_GRANTED_EVENT = "meta_consent_granted";

function hasPublishedMetaConsentGranted(): boolean {
  if (typeof window === "undefined") return false;
  return window.__mdpMetaConsentGrantedPublished === true;
}

function markMetaConsentGrantedPublished(): void {
  if (typeof window === "undefined") return;
  window.__mdpMetaConsentGrantedPublished = true;
}

/**
 * GTM Custom Event that may initialize the Meta Pixel base tag.
 * Once per page load — never on denied consent.
 */
export function publishMetaConsentGranted(): void {
  if (!canTrackMarketing()) return;
  if (hasPublishedMetaConsentGranted()) return;
  const pixelId = getMetaPixelId();
  if (!pixelId) return;
  markMetaConsentGrantedPublished();
  pushDataLayer({
    event: META_CONSENT_GRANTED_EVENT,
    meta_pixel_id: pixelId,
  });
}

export function publishMetaPixelId(): void {
  if (!canTrackMarketing()) return;
  const pixelId = getMetaPixelId();
  if (!pixelId) return;
  pushDataLayer({ meta_pixel_id: pixelId });
  publishMetaConsentGranted();
}

export function buildPageViewEvent(
  pagePath: string,
  pageLocation: string,
  pageTitle: string,
  eventId?: string,
): DataLayerEntry {
  return withEventId(
    {
      event: "page_view",
      page_path: pagePath,
      page_location: pageLocation,
      page_title: pageTitle,
    },
    eventId,
  );
}

export function trackPageView(pagePath: string): void {
  if (typeof window === "undefined") return;
  pushMarketingEvent(
    buildPageViewEvent(pagePath, window.location.href, document.title),
  );
}

export function buildViewItemEvent(payload: ViewItemPayload): DataLayerEntry {
  const currency = payload.currency ?? CURRENCY_CODE;
  return withEventId({
    event: "view_item",
    currency,
    value: payload.price,
    content_type: "product",
    content_ids: [payload.itemId],
    content_name: payload.itemName,
    ecommerce: {
      currency,
      value: payload.price,
      items: [
        toEcommerceItem({
          itemId: payload.itemId,
          itemName: payload.itemName,
          price: payload.price,
          quantity: 1,
        }),
      ],
    },
  });
}

export function trackViewItem(payload: ViewItemPayload): void {
  pushMarketingEvent(buildViewItemEvent(payload));
}

export function buildAddToCartEvent(payload: AddToCartPayload): DataLayerEntry {
  const currency = payload.currency ?? CURRENCY_CODE;
  const value = payload.price * payload.quantity;
  return withEventId({
    event: "add_to_cart",
    currency,
    value,
    content_type: "product",
    content_ids: [payload.itemId],
    content_name: payload.itemName,
    ecommerce: {
      currency,
      value,
      items: [toEcommerceItem(payload)],
    },
  });
}

export function trackAddToCart(payload: AddToCartPayload): void {
  pushMarketingEvent(buildAddToCartEvent(payload));
}

export function buildBeginCheckoutEvent(
  payload: BeginCheckoutPayload,
): DataLayerEntry {
  const currency = payload.currency ?? CURRENCY_CODE;
  return withEventId({
    event: "begin_checkout",
    currency,
    value: payload.value,
    content_ids: payload.items.map((item) => item.itemId),
    ecommerce: {
      currency,
      value: payload.value,
      items: payload.items.map(toEcommerceItem),
    },
  });
}

function checkoutSignature(payload: BeginCheckoutPayload): string {
  return `${payload.value}|${payload.items
    .map((item) => `${item.itemId}:${item.quantity}`)
    .join(",")}`;
}

export function trackBeginCheckout(payload: BeginCheckoutPayload): void {
  if (payload.items.length === 0) return;
  const signature = checkoutSignature(payload);
  if (readSessionKey(BEGIN_CHECKOUT_DEDUP_KEY) === signature) return;
  writeSessionKey(BEGIN_CHECKOUT_DEDUP_KEY, signature);
  pushMarketingEvent(buildBeginCheckoutEvent(payload));
}

export function buildPurchaseEvent(payload: PurchasePayload): DataLayerEntry {
  const currency = payload.currency ?? CURRENCY_CODE;
  return withEventId(
    {
      event: "purchase",
      currency,
      value: payload.value,
      transaction_id: payload.transactionId,
      content_ids: payload.items.map((item) => item.itemId),
      ecommerce: {
        transaction_id: payload.transactionId,
        currency,
        value: payload.value,
        items: payload.items.map(toEcommerceItem),
      },
    },
    payload.eventId,
  );
}

export function trackPurchase(payload: PurchasePayload): void {
  const transactionId = payload.transactionId.trim();
  if (!transactionId || payload.items.length === 0) return;

  const dedupKey = `${PURCHASE_DEDUP_PREFIX}${transactionId}`;
  if (readSessionKey(dedupKey)) return;
  writeSessionKey(dedupKey, "1");
  pushMarketingEvent(buildPurchaseEvent({ ...payload, transactionId }));
}

export function buildSubscribedButtonClickEvent(
  payload: SubscribedButtonClickPayload = {},
): DataLayerEntry {
  return withEventId(
    { event: "SubscribedButtonClick" },
    payload.eventId,
  );
}

export function trackSubscribedButtonClick(
  payload: SubscribedButtonClickPayload = {},
): void {
  pushMarketingEvent(buildSubscribedButtonClickEvent(payload));
}

export function buildSearchEvent(searchTerm: string): DataLayerEntry {
  return withEventId({
    event: "search",
    search_term: searchTerm,
  });
}

export function trackSearch(searchTerm: string): void {
  if (!searchTerm) return;
  pushMarketingEvent(buildSearchEvent(searchTerm));
}
