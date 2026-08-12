"use client";

import { useEffect } from "react";
import { CONSENT_EVENT, hasAnalyticsConsent } from "@/lib/consent";

function trackVisit() {
  fetch("/api/track-visit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: window.location.pathname }),
    keepalive: true,
  }).catch(() => {});
}

export default function VisitTracker() {
  useEffect(() => {
    // Only track once the visitor has accepted the cookie/privacy notice —
    // never track on page load by default.
    if (hasAnalyticsConsent()) {
      trackVisit();
    }

    // If they accept the banner during this same page view, track immediately
    // rather than waiting for the next page load.
    window.addEventListener(CONSENT_EVENT, trackVisit);
    return () => window.removeEventListener(CONSENT_EVENT, trackVisit);
  }, []);

  return null;
}
