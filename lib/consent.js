export const CONSENT_KEY = "falcon-cookie-consent";
export const CONSENT_EVENT = "falcon-cookie-consent-accepted";

export function getConsent() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CONSENT_KEY);
}

export function hasAnalyticsConsent() {
  return getConsent() === "accepted";
}
