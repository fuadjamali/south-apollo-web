export const LOCALES = ["en", "bn"];
export const DEFAULT_LOCALE = "en";
export const LOCALE_COOKIE = "locale";

// Shown on the switcher — each language named in its own script.
export const LOCALE_LABELS = { en: "EN", bn: "বাংলা" };

export function isLocale(value) {
  return LOCALES.includes(value);
}
