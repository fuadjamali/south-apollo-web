import { db } from "@/lib/db";

async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS ai_settings (
        id SERIAL PRIMARY KEY,
        enabled BOOLEAN NOT NULL DEFAULT true,
        api_key VARCHAR(255),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    // See lib/sectionHeadings.js's ensureTable comment — concurrent first-time
    // "CREATE TABLE IF NOT EXISTS" callers can race under Postgres.
    if (err.code !== "23505" && err.code !== "42P07") throw err;
  }
}

// Singleton, always row id=1 — seeded via an explicit id (not the SERIAL default) with
// ON CONFLICT DO NOTHING, atomic under concurrent requests ("SELECT COUNT then INSERT if
// empty" is racy and duplicated this exact table for real during a production restore under
// concurrent traffic — see lib/businessInfo.js's ensureRow comment). Defaults to enabled so a
// deployment that already has ANTHROPIC_API_KEY set via env var keeps working exactly as
// before this existed, without an admin needing to find a new toggle first.
async function ensureRow() {
  await ensureTable();
  await db.query(
    "INSERT INTO ai_settings (id, enabled) VALUES (1, true) ON CONFLICT (id) DO NOTHING"
  );
}

export async function getAISettings() {
  await ensureRow();
  const { rows } = await db.query("SELECT * FROM ai_settings WHERE id = 1");
  return rows[0];
}

// apiKey: undefined leaves the stored key untouched, null clears it (falls back to
// ANTHROPIC_API_KEY if set), a string replaces it.
export async function updateAISettings({ enabled, apiKey }) {
  await ensureRow();
  if (apiKey === undefined) {
    await db.query("UPDATE ai_settings SET enabled = $1, updated_at = now() WHERE id = 1", [
      enabled,
    ]);
  } else {
    await db.query(
      "UPDATE ai_settings SET enabled = $1, api_key = $2, updated_at = now() WHERE id = 1",
      [enabled, apiKey]
    );
  }
}
