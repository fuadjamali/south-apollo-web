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

async function seedIfEmpty() {
  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM about_info");
  if (rows[0].count > 0) return;

  await db.query(
    "INSERT INTO about_info (heading, body) VALUES ($1, $2)",
    ["About Us", "ABOUT_BODY"]
  );
}

// Singleton — always operates on the single row, same pattern as lib/contactInfo.js.
export async function getAboutInfo() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query("SELECT * FROM about_info ORDER BY id LIMIT 1");
  return rows[0];
}

export async function updateAboutInfo({ heading, body }) {
  await ensureTable();
  await seedIfEmpty();
  await db.query(
    `UPDATE about_info
     SET heading = $1, body = $2, updated_at = now()
     WHERE id = (SELECT id FROM about_info ORDER BY id LIMIT 1)`,
    [heading, body || null]
  );
}
