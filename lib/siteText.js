import { db } from "@/lib/db";

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

export async function getSiteText() {
  await ensureRow();
  const { rows } = await db.query("SELECT * FROM site_text WHERE id = 1");
  return rows[0];
}

export async function updateCookieConsentText({ message, acceptLabel, declineLabel }) {
  await ensureRow();
  await db.query(
    "UPDATE site_text SET cookie_message = $1, cookie_accept_label = $2, cookie_decline_label = $3, updated_at = now() WHERE id = 1",
    [message, acceptLabel, declineLabel]
  );
}

export async function updateSiteUnavailableText({ errorCodeLabel, heading, message }) {
  await ensureRow();
  await db.query(
    "UPDATE site_text SET unavailable_error_code_label = $1, unavailable_heading = $2, unavailable_message = $3, updated_at = now() WHERE id = 1",
    [errorCodeLabel, heading, message]
  );
}
