import { db } from "@/lib/db";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { localizeFields, mergeTranslationSql } from "@/lib/i18n/localize";

// The banner shown at the very top of every page (app/layout.js) — used to live as a
// hardcoded, always-on string in config/site.js (siteConfig.demoDisclaimer). Now a singleton
// row so an admin can turn it on/off and reword it without a code change — e.g. a temporary
// "under construction" or "prices increasing" notice, not just South Apollo's own demo
// disclaimer.
async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS root_alert (
        id INT PRIMARY KEY,
        enabled BOOLEAN NOT NULL DEFAULT true,
        message TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    // See lib/sectionHeadings.js's ensureTable comment — concurrent first-time
    // "CREATE TABLE IF NOT EXISTS" callers can race under Postgres.
    if (err.code !== "23505" && err.code !== "42P07") throw err;
  }
  // Banner text in other languages, { bn: { message } } — lib/i18n/localize.js.
  await db.query(
    `ALTER TABLE root_alert ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb`
  );
}

// Seed value — this deployment's real current banner text (the old config/site.js default).
const DEFAULT_MESSAGE =
  "This is a demo site showcasing South Apollo's features — it does not represent a real business.";

async function ensureRow() {
  await ensureTable();
  await db.query(
    "INSERT INTO root_alert (id, enabled, message) VALUES (1, true, $1) ON CONFLICT (id) DO NOTHING",
    [DEFAULT_MESSAGE]
  );
}

// `locale` swaps in that language's message where set (English otherwise).
export async function getRootAlert(locale = DEFAULT_LOCALE) {
  await ensureRow();
  const { rows } = await db.query("SELECT * FROM root_alert WHERE id = 1");
  return localizeFields(rows[0], locale, ["message"]);
}

export async function updateRootAlert({ enabled, message, messageBn }) {
  await ensureRow();
  await db.query(
    `UPDATE root_alert SET enabled = $1, message = $2, ${mergeTranslationSql("$3", "$4")},
       updated_at = now()
     WHERE id = 1`,
    [enabled, message, "bn", JSON.stringify({ message: messageBn || "" })]
  );
}
