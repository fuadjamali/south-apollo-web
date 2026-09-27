import { db } from "@/lib/db";
import { OVERLAY_STRENGTHS, TEXT_STYLES } from "@/lib/overlaySettings";

export const IMAGE_POSITIONS = ["left", "right", "behind"];

async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS about_info (
        id SERIAL PRIMARY KEY,
        heading VARCHAR(255) NOT NULL DEFAULT 'About Us',
        body TEXT,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    // See lib/sectionHeadings.js's ensureTable comment — concurrent first-time
    // "CREATE TABLE IF NOT EXISTS" callers can race under Postgres.
    if (err.code !== "23505" && err.code !== "42P07") throw err;
  }
  // Added after the table already shipped — see lib/heroSlides.js's ensureTable comment for why
  // this is ALTER TABLE ADD COLUMN IF NOT EXISTS rather than folded into CREATE TABLE. Defaults
  // (no image, "left") match the section's original text-only/centered behavior, so an existing
  // site sees no change until an admin deliberately uploads one.
  await db.query(`ALTER TABLE about_info ADD COLUMN IF NOT EXISTS image VARCHAR(500)`);
  await db.query(
    `ALTER TABLE about_info ADD COLUMN IF NOT EXISTS image_position VARCHAR(6) NOT NULL DEFAULT 'left'`
  );
  await db.query(
    `ALTER TABLE about_info ADD COLUMN IF NOT EXISTS overlay_strength VARCHAR(10) NOT NULL DEFAULT 'medium'`
  );
  await db.query(
    `ALTER TABLE about_info ADD COLUMN IF NOT EXISTS text_style VARCHAR(10) NOT NULL DEFAULT 'auto'`
  );
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

export async function updateAboutInfo({
  heading,
  body,
  image,
  imagePosition,
  overlayStrength,
  textStyle,
}) {
  await ensureTable();
  await ensureRow();
  await db.query(
    `UPDATE about_info
     SET heading = $1, body = $2, image = $3, image_position = $4,
         overlay_strength = $5, text_style = $6, updated_at = now()
     WHERE id = 1`,
    [
      heading,
      body || null,
      image || null,
      IMAGE_POSITIONS.includes(imagePosition) ? imagePosition : "left",
      OVERLAY_STRENGTHS.includes(overlayStrength) ? overlayStrength : "medium",
      TEXT_STYLES.includes(textStyle) ? textStyle : "auto",
    ]
  );
}
