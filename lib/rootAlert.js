import { db } from "@/lib/db";

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

export async function getRootAlert() {
  await ensureRow();
  const { rows } = await db.query("SELECT * FROM root_alert WHERE id = 1");
  return rows[0];
}

export async function updateRootAlert({ enabled, message }) {
  await ensureRow();
  await db.query(
    "UPDATE root_alert SET enabled = $1, message = $2, updated_at = now() WHERE id = 1",
    [enabled, message]
  );
}
