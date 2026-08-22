"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useConsent } from "@/contexts/ConsentContext";
import { getGtmId } from "@/lib/analytics/config";
import { publishMetaPixelId } from "@/lib/analytics/events";
import { isStaffPath } from "@/lib/consent/routes";

export function GoogleTagManager() {
  const pathname = usePathname();
  const { ready, canLoadTags } = useConsent();
  const gtmId = getGtmId();

  if (!ready || !canLoadTags || !gtmId || isStaffPath(pathname)) {
    return null;
  }

  // Official GTM snippet. No noscript iframe: that would load tags without
  // a consent choice (JS is required for the CMP).
  return (
    <Script
      id="gtm-loader"
      strategy="afterInteractive"
      onLoad={publishMetaPixelId}
    >
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
    </Script>
  );
}
