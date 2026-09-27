import { db } from "@/lib/db";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { localizeFields, mergeTranslationSql } from "@/lib/i18n/localize";

const TRANSLATABLE_FIELDS = [
  "cookie_message",
  "cookie_accept_label",
  "cookie_decline_label",
  "unavailable_error_code_label",
  "unavailable_heading",
  "unavailable_message",
];

// Small, miscellaneous site-wide text blocks that used to be hardcoded in config/site.js:
// the cookie consent banner (shown once per visitor on the home page) and the copy shown on
// the 401 "Site Unavailable" page (any route proxy.js doesn't recognize). Bundled into one
// singleton row since both are a handful of short strings, not a list of records.
async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS site_text (
        id INT PRIMARY KEY,
        cookie_message TEXT NOT NULL,
        cookie_accept_label VARCHAR(50) NOT NULL,
        cookie_decline_label VARCHAR(50) NOT NULL,
        unavailable_error_code_label VARCHAR(50) NOT NULL,
        unavailable_heading VARCHAR(255) NOT NULL,
        unavailable_message TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    // See lib/sectionHeadings.js's ensureTable comment — concurrent first-time
    // "CREATE TABLE IF NOT EXISTS" callers can race under Postgres.
    if (err.code !== "23505" && err.code !== "42P07") throw err;
  }
  // Other-language versions of every text column, { bn: { cookie_message, … } }.
  await db.query(
    `ALTER TABLE site_text ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb`
  );
}

// Seed values — this deployment's real current text (the old config/site.js defaults).
const DEFAULTS = {
  cookieMessage:
    "We use minimal analytics (page visits, general location) to understand how visitors use this site. See our privacy practices for details.",
  cookieAcceptLabel: "Accept",
  cookieDeclineLabel: "Decline",
  unavailableErrorCodeLabel: "Error 401",
  unavailableHeading: "Site unavailable",
  unavailableMessage: "This page doesn't exist or isn't accessible. Check the link and try again.",
};

async function ensureRow() {
  await ensureTable();
  await db.query(
    `INSERT INTO site_text (
       id, cookie_message, cookie_accept_label, cookie_decline_label,
       unavailable_error_code_label, unavailable_heading, unavailable_message
     ) VALUES (1, $1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO NOTHING`,
    [
      DEFAULTS.cookieMessage,
      DEFAULTS.cookieAcceptLabel,
      DEFAULTS.cookieDeclineLabel,
      DEFAULTS.unavailableErrorCodeLabel,
      DEFAULTS.unavailableHeading,
      DEFAULTS.unavailableMessage,
    ]
  );
}

// `locale` overlays that language's text where set; admin passes nothing and gets the English
// columns plus the raw `translations` object to prefill its Bangla fields.
export async function getSiteText(locale = DEFAULT_LOCALE) {
  await ensureRow();
  const { rows } = await db.query("SELECT * FROM site_text WHERE id = 1");
  return localizeFields(rows[0], locale, TRANSLATABLE_FIELDS);
}

export async function updateCookieConsentText({ message, acceptLabel, declineLabel, bn = {} }) {
  await ensureRow();
  await db.query(
    `UPDATE site_text SET cookie_message = $1, cookie_accept_label = $2, cookie_decline_label = $3,
       ${mergeTranslationSql("$4", "$5")}, updated_at = now()
     WHERE id = 1`,
    [
      message,
      acceptLabel,
      declineLabel,
      "bn",
      JSON.stringify({
        cookie_message: bn.message || "",
        cookie_accept_label: bn.acceptLabel || "",
        cookie_decline_label: bn.declineLabel || "",
      }),
    ]
  );
}

export async function updateSiteUnavailableText({ errorCodeLabel, heading, message, bn = {} }) {
  await ensureRow();
  await db.query(
    `UPDATE site_text SET unavailable_error_code_label = $1, unavailable_heading = $2,
       unavailable_message = $3, ${mergeTranslationSql("$4", "$5")}, updated_at = now()
     WHERE id = 1`,
    [
      errorCodeLabel,
      heading,
      message,
      "bn",
      JSON.stringify({
        unavailable_error_code_label: bn.errorCodeLabel || "",
        unavailable_heading: bn.heading || "",
        unavailable_message: bn.message || "",
      }),
    ]
  );
}
