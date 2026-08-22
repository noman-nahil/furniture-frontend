/**
 * Sets Google Consent Mode to denied before any tag can run.
 * Plain script (not next/script) so it ships in the first HTML, like JSON-LD.
 * This is not a marketing tag — it only records a denied default.
 */
export function ConsentDefaultsScript() {
  return (
    <script
      id="gtm-consent-default"
      dangerouslySetInnerHTML={{
        __html:
          "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});",
      }}
    />
  );
}
