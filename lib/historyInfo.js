import { db } from "@/lib/db";
import { OVERLAY_STRENGTHS, TEXT_STYLES } from "@/lib/overlaySettings";

export const IMAGE_POSITIONS = ["left", "right", "behind"];

async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS history_info (
        id SERIAL PRIMARY KEY,
        heading VARCHAR(255) NOT NULL DEFAULT 'Our History',
        body TEXT,
        image VARCHAR(500),
        image_position VARCHAR(6) NOT NULL DEFAULT 'right',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    // See lib/sectionHeadings.js's ensureTable comment — concurrent first-time
    // "CREATE TABLE IF NOT EXISTS" callers can race under Postgres.
    if (err.code !== "23505" && err.code !== "42P07") throw err;
  }
  // See lib/visionMissionInfo.js's ensureTable comment — same widen-after-shipped column plus
  // the same two new overlay columns, for the same reason (adding a "behind" position option).
  await db.query(`ALTER TABLE history_info ALTER COLUMN image_position TYPE VARCHAR(6)`);
  await db.query(
    `ALTER TABLE history_info ADD COLUMN IF NOT EXISTS overlay_strength VARCHAR(10) NOT NULL DEFAULT 'medium'`
  );
  await db.query(
    `ALTER TABLE history_info ADD COLUMN IF NOT EXISTS text_style VARCHAR(10) NOT NULL DEFAULT 'auto'`
  );
}

// Singleton, always row id=1 — same pattern as lib/visionMissionInfo.js, including the
// empty-body seed (see that file's ensureRow comment for why: this module defaults to off, and
// app/page.js only renders it once an admin has written a body).
async function ensureRow() {
  await db.query(
    "INSERT INTO history_info (id, heading) VALUES (1, $1) ON CONFLICT (id) DO NOTHING",
    ["Our History"]
  );
}

export async function getHistoryInfo() {
  await ensureTable();
  await ensureRow();
  const { rows } = await db.query("SELECT * FROM history_info WHERE id = 1");
  return rows[0];
}

export async function updateHistoryInfo({
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
    `UPDATE history_info
     SET heading = $1, body = $2, image = $3, image_position = $4,
         overlay_strength = $5, text_style = $6, updated_at = now()
     WHERE id = 1`,
    [
      heading,
      body || null,
      image || null,
      IMAGE_POSITIONS.includes(imagePosition) ? imagePosition : "right",
      OVERLAY_STRENGTHS.includes(overlayStrength) ? overlayStrength : "medium",
      TEXT_STYLES.includes(textStyle) ? textStyle : "auto",
    ]
  );
}
