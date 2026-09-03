import { db } from "@/lib/db";

export const IMAGE_POSITIONS = ["left", "right"];

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS history_info (
      id SERIAL PRIMARY KEY,
      heading VARCHAR(255) NOT NULL DEFAULT 'Our History',
      body TEXT,
      image VARCHAR(500),
      image_position VARCHAR(5) NOT NULL DEFAULT 'right',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
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

export async function updateHistoryInfo({ heading, body, image, imagePosition }) {
  await ensureTable();
  await ensureRow();
  await db.query(
    `UPDATE history_info
     SET heading = $1, body = $2, image = $3, image_position = $4, updated_at = now()
     WHERE id = 1`,
    [
      heading,
      body || null,
      image || null,
      IMAGE_POSITIONS.includes(imagePosition) ? imagePosition : "right",
    ]
  );
}
