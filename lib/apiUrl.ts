/** Join API base URL and path without double slashes. */
export function joinApiUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * API base URL for browser-side fetch calls.
 * When NEXT_PUBLIC_API_URL points at localhost but the page is opened via
 * a LAN IP (e.g. http://192.168.x.x:3000), rewrite the hostname so requests
 * reach the dev machine instead of the client's own loopback.
 */
export function getClientApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL ?? "";
  if (!configured) return "";

  if (typeof window !== "undefined") {
    try {
      const url = new URL(configured);
      const apiIsLoopback =
        url.hostname === "localhost" || url.hostname === "127.0.0.1";
      const pageHost = window.location.hostname;
      const pageIsLoopback =
        pageHost === "localhost" || pageHost === "127.0.0.1";

      if (apiIsLoopback && !pageIsLoopback) {
        url.hostname = pageHost;
        return `${url.origin}${url.pathname}`.replace(/\/+$/, "");
      }
    } catch {
      // fall through to configured value
    }
  }

  return configured.replace(/\/+$/, "");
}
