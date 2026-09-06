export type DataLayerEntry = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerEntry[];
    gtag?: (...args: unknown[]) => void;
    __mdpMetaConsentGrantedPublished?: boolean;
  }
}

function getDataLayer(): DataLayerEntry[] | null {
  if (typeof window === "undefined") return null;
  window.dataLayer = window.dataLayer ?? [];
  return window.dataLayer;
}

/** Safe on the server — no-ops when `window` is unavailable. */
export function pushDataLayer(entry: DataLayerEntry): void {
  const dataLayer = getDataLayer();
  if (!dataLayer) return;
  dataLayer.push(entry);
}

export function applyConsentMode(choices: {
  analytics: boolean;
  marketing: boolean;
}): void {
  if (typeof window === "undefined") return;

  const granted = (value: boolean) => (value ? "granted" : "denied");
  const update = {
    analytics_storage: granted(choices.analytics),
    ad_storage: granted(choices.marketing),
    ad_user_data: granted(choices.marketing),
    ad_personalization: granted(choices.marketing),
  };

  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", update);
    return;
  }

  pushDataLayer({
    event: "consent_update",
    ...update,
  });
}
