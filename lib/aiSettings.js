import { db } from "@/lib/db";

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS ai_settings (
      id SERIAL PRIMARY KEY,
      enabled BOOLEAN NOT NULL DEFAULT true,
      api_key VARCHAR(255),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

// Singleton, same pattern as contact_info/about_info — one row, no create/delete. Defaults to
// enabled so a deployment that already has ANTHROPIC_API_KEY set via env var keeps working
// exactly as before this existed, without an admin needing to find a new toggle first.
async function ensureRow() {
  await ensureTable();
  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM ai_settings");
  if (rows[0].count === 0) {
    await db.query("INSERT INTO ai_settings (enabled) VALUES (true)");
  }
}

export async function getAISettings() {
  await ensureRow();
  const { rows } = await db.query("SELECT * FROM ai_settings ORDER BY id ASC LIMIT 1");
  return rows[0];
}

// apiKey: undefined leaves the stored key untouched, null clears it (falls back to
// ANTHROPIC_API_KEY if set), a string replaces it.
export async function updateAISettings({ enabled, apiKey }) {
  await ensureRow();
  if (apiKey === undefined) {
    await db.query("UPDATE ai_settings SET enabled = $1, updated_at = now()", [enabled]);
  } else {
    await db.query(
      "UPDATE ai_settings SET enabled = $1, api_key = $2, updated_at = now()",
      [enabled, apiKey]
    );
  }
}
