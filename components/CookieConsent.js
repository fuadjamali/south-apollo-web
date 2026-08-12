"use client";

import { useEffect, useState } from "react";
import { CONSENT_EVENT, CONSENT_KEY, getConsent } from "@/lib/consent";
import siteConfig from "@/config/site";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getConsent() === null);
  }, []);

  function respond(value) {
    window.localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
    if (value === "accepted") {
      window.dispatchEvent(new Event(CONSENT_EVENT));
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-30 max-w-sm rounded-xl border border-border bg-surface p-4 shadow-lg">
      <p className="text-sm text-foreground">{siteConfig.cookieConsent.message}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => respond("declined")}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-alt"
        >
          {siteConfig.cookieConsent.declineLabel}
        </button>
        <button
          type="button"
          onClick={() => respond("accepted")}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          {siteConfig.cookieConsent.acceptLabel}
        </button>
      </div>
    </div>
  );
}
