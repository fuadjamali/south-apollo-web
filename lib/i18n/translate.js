import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import en from "@/lib/i18n/dictionaries/en";
import bn from "@/lib/i18n/dictionaries/bn";

const DICTIONARIES = { en, bn };

// Missing in the active language → English → the key itself, so a half-translated dictionary
// never renders blank. `{name}` placeholders are filled from `vars`.
export function translate(locale, key, vars) {
  let text = DICTIONARIES[locale]?.[key] ?? DICTIONARIES[DEFAULT_LOCALE][key] ?? key;
  if (vars) {
    text = text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
  }
  return text;
}

export function makeT(locale) {
  return (key, vars) => translate(locale, key, vars);
}

// Digits stay 0-9 in every language (client requirement): the -u-nu-latn extension keeps
// Bangla month/day names while forcing Latin numerals.
const INTL_LOCALES = { en: "en-US", bn: "bn-BD-u-nu-latn" };

export function formatDate(value, locale, options) {
  return new Date(value).toLocaleDateString(INTL_LOCALES[locale] || INTL_LOCALES.en, options);
}
