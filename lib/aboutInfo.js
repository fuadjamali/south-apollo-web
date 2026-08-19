import { db } from "@/lib/db";

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS about_info (
      id SERIAL PRIMARY KEY,
      heading VARCHAR(255) NOT NULL DEFAULT 'About Us',
      body TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

// Singleton, always row id=1 — seeded via an explicit id (not the SERIAL default) with
// ON CONFLICT DO NOTHING, atomic under concurrent requests. See lib/businessInfo.js's
// ensureRow comment for why ("SELECT COUNT then INSERT if empty" is racy and duplicated
// business_info for real during ordinary concurrent page loads).
async function ensureRow() {
  await db.query(
    "INSERT INTO about_info (id, heading, body) VALUES (1, $1, $2) ON CONFLICT (id) DO NOTHING",
    ["About Us", "ABOUT_BODY"]
  );
}

// Singleton — always operates on the single row, same pattern as lib/contactInfo.js.
export async function getAboutInfo() {
  await ensureTable();
  await ensureRow();
  const { rows } = await db.query("SELECT * FROM about_info WHERE id = 1");
  return rows[0];
}

export async function updateAboutInfo({ heading, body }) {
  await ensureTable();
  await ensureRow();
  await db.query(
    "UPDATE about_info SET heading = $1, body = $2, updated_at = now() WHERE id = 1",
    [heading, body || null]
  );
}
