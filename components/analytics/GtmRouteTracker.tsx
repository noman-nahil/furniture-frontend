"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useConsent } from "@/contexts/ConsentContext";
import { trackPageView } from "@/lib/analytics/events";
import { isStaffPath } from "@/lib/consent/routes";

export function GtmRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { ready, canTrackMarketing } = useConsent();
  const lastPathRef = useRef<string | null>(null);

  const search = searchParams.toString();
  const pagePath = search ? `${pathname}?${search}` : pathname;

  useEffect(() => {
    if (!ready || !canTrackMarketing || isStaffPath(pathname)) return;
    if (lastPathRef.current === pagePath) return;
    lastPathRef.current = pagePath;
    trackPageView(pagePath);
  }, [ready, canTrackMarketing, pathname, pagePath]);

  return null;
}
