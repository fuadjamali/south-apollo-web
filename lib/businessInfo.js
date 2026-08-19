import { db } from "@/lib/db";

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS business_info (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      tagline VARCHAR(255),
      description TEXT,
      domain VARCHAR(255),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

// Singleton, always row id=1 — seeded via an explicit id (not the SERIAL default) with
// ON CONFLICT DO NOTHING, which is atomic under concurrent requests. The previous
// "SELECT COUNT then INSERT if empty" pattern had a race: two concurrent first-requests could
// both see count=0 and both insert, leaving two rows and an ambiguous "current" one — this bit
// ai_settings for real during a production restore under concurrent traffic. Seeded from this
// deployment's real current values (config/site.js's old static `business` block), not
// placeholders. `address` is deliberately not here — see lib/contactInfo.js.
async function ensureRow() {
  await db.query(
    `INSERT INTO business_info (id, name, tagline, description, domain)
     VALUES (1, $1, $2, $3, $4)
     ON CONFLICT (id) DO NOTHING`,
    [
      "Falcon Web Suite",
      "Simple to start. Built to grow.",
      "A modular website platform for small businesses — content, booking, online sales, and an AI content assistant, all in one suite. Start on Basic and upgrade whenever you're ready.",
      "falconwebsuite.com",
    ]
  );
}

export async function getBusinessInfo() {
  await ensureTable();
  await ensureRow();
  const { rows } = await db.query("SELECT * FROM business_info WHERE id = 1");
  return rows[0];
}

export async function updateBusinessInfo({ name, tagline, description, domain }) {
  await ensureTable();
  await ensureRow();
  await db.query(
    `UPDATE business_info
     SET name = $1, tagline = $2, description = $3, domain = $4, updated_at = now()
     WHERE id = 1`,
    [name, tagline || null, description || null, domain || null]
  );
}
