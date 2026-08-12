import { db } from "@/lib/db";

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS contact_info (
      id SERIAL PRIMARY KEY,
      heading VARCHAR(255) NOT NULL DEFAULT 'Contact Us',
      subheading TEXT,
      address TEXT,
      phone VARCHAR(50),
      email VARCHAR(255),
      enabled BOOLEAN NOT NULL DEFAULT true,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function seedIfEmpty() {
  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM contact_info");
  if (rows[0].count > 0) return;

  await db.query(
    `INSERT INTO contact_info (heading, subheading, address, phone, email, enabled)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      "Contact Us",
      "Get in touch with us directly.",
      "YOUR_BUSINESS_ADDRESS",
      "YOUR_PHONE_NUMBER",
      "hello@example.com",
      true,
    ]
  );
}

// Singleton — always operates on the single row (there is never more than one; enforced by
// only ever inserting via seedIfEmpty and never exposing a create action).
export async function getContactInfo() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query("SELECT * FROM contact_info ORDER BY id LIMIT 1");
  return rows[0];
}

export async function updateContactInfo({ heading, subheading, address, phone, email, enabled }) {
  await ensureTable();
  await seedIfEmpty();
  await db.query(
    `UPDATE contact_info
     SET heading = $1, subheading = $2, address = $3, phone = $4, email = $5, enabled = $6, updated_at = now()
     WHERE id = (SELECT id FROM contact_info ORDER BY id LIMIT 1)`,
    [heading, subheading || null, address || null, phone || null, email || null, enabled]
  );
}
