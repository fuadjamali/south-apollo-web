import { db } from "@/lib/db";

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS branding (
      id SERIAL PRIMARY KEY,
      logo_url VARCHAR(500),
      favicon_url VARCHAR(500),
      apple_icon_url VARCHAR(500),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

// Singleton, always row id=1 — see lib/businessInfo.js's ensureRow comment for why this
// pattern (explicit id + ON CONFLICT DO NOTHING) instead of "SELECT COUNT then INSERT if
// empty", which is racy under concurrent requests. All three URLs default to NULL — every
// consumer (components/Logo.js, app/layout.js's favicon metadata) falls back to the built-in
// vector mark / app/icon.svg when nothing's been uploaded, so a fresh deployment looks correct
// before an admin ever visits this page.
async function ensureRow() {
  await db.query(
    "INSERT INTO branding (id) VALUES (1) ON CONFLICT (id) DO NOTHING"
  );
}

export async function getBranding() {
  await ensureTable();
  await ensureRow();
  const { rows } = await db.query("SELECT * FROM branding WHERE id = 1");
  return rows[0];
}

export async function updateBranding({ logoUrl, faviconUrl, appleIconUrl }) {
  await ensureTable();
  await ensureRow();
  await db.query(
    `UPDATE branding
     SET logo_url = $1, favicon_url = $2, apple_icon_url = $3, updated_at = now()
     WHERE id = 1`,
    [logoUrl || null, faviconUrl || null, appleIconUrl || null]
  );
}
