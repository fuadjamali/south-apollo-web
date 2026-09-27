export const CONSENT_KEY = "south-apollo-cookie-consent";
export const CONSENT_EVENT = "south-apollo-cookie-consent-accepted";

export function getConsent() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CONSENT_KEY);
}

export function hasAnalyticsConsent() {
  return getConsent() === "accepted";
}
