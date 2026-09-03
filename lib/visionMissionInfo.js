import { db } from "@/lib/db";

export const IMAGE_POSITIONS = ["left", "right"];

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS vision_mission_info (
      id SERIAL PRIMARY KEY,
      heading VARCHAR(255) NOT NULL DEFAULT 'Vision & Mission',
      body TEXT,
      image VARCHAR(500),
      image_position VARCHAR(5) NOT NULL DEFAULT 'left',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

// Singleton, always row id=1 — same pattern as lib/aboutInfo.js. Seeded with an empty body
// deliberately (not placeholder copy): this module defaults to off (see lib/moduleSettings.js's
// ensureTable seed) precisely because most clients don't need it, and app/page.js only renders
// the section once an admin has actually written a body, so an empty seed never shows a blank
// section to a client who switched the module on without filling it in yet.
async function ensureRow() {
  await db.query(
    "INSERT INTO vision_mission_info (id, heading) VALUES (1, $1) ON CONFLICT (id) DO NOTHING",
    ["Vision & Mission"]
  );
}

export async function getVisionMissionInfo() {
  await ensureTable();
  await ensureRow();
  const { rows } = await db.query("SELECT * FROM vision_mission_info WHERE id = 1");
  return rows[0];
}

export async function updateVisionMissionInfo({ heading, body, image, imagePosition }) {
  await ensureTable();
  await ensureRow();
  await db.query(
    `UPDATE vision_mission_info
     SET heading = $1, body = $2, image = $3, image_position = $4, updated_at = now()
     WHERE id = 1`,
    [
      heading,
      body || null,
      image || null,
      IMAGE_POSITIONS.includes(imagePosition) ? imagePosition : "left",
    ]
  );
}
