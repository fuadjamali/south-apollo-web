import { DEFAULT_LOCALE } from "@/lib/i18n/config";

// Admin-editable rows keep their English text in the normal columns and other languages in a
// `translations` JSONB column shaped { bn: { field: "..." } }. This overlays the active
// language onto a copy of the row; a blank or missing translation keeps the English value.
export function localizeFields(row, locale, fields) {
  if (!row || locale === DEFAULT_LOCALE) return row;
  const overlay = row.translations?.[locale] || {};
  const out = { ...row };
  for (const field of fields) {
    const value = overlay[field];
    if (typeof value === "string" && value.trim()) out[field] = value;
  }
  return out;
}

// SQL fragment merging `$n` (a JSON object of one language's fields) into that language's
// entry, leaving other fields and languages untouched — e.g. the cookie-banner and 401-page
// forms each save their own Bangla fields into the same site_text row without clobbering the
// other's.
export function mergeTranslationSql(localeParam, fieldsParam) {
  return `translations = jsonb_set(COALESCE(translations, '{}'::jsonb), ARRAY[${localeParam}::text], COALESCE(translations -> ${localeParam}::text, '{}'::jsonb) || ${fieldsParam}::jsonb)`;
}
