import { db } from "@/lib/db";

async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS stats (
        id SERIAL PRIMARY KEY,
        value VARCHAR(50) NOT NULL,
        label VARCHAR(255) NOT NULL,
        display_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    // See lib/sectionHeadings.js's ensureTable comment — concurrent first-time
    // "CREATE TABLE IF NOT EXISTS" callers can race under Postgres.
    if (err.code !== "23505" && err.code !== "42P07") throw err;
  }
}

// Same placeholder content that used to live in config/site.js.
const DEFAULT_STATS = [
  { value: "500+", label: "STAT_1_LABEL", display_order: 1 },
  { value: "10", label: "STAT_2_LABEL", display_order: 2 },
  { value: "50+", label: "STAT_3_LABEL", display_order: 3 },
  { value: "98%", label: "STAT_4_LABEL", display_order: 4 },
];

async function seedIfEmpty() {
  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM stats");
  if (rows[0].count > 0) return;

  for (const s of DEFAULT_STATS) {
    await db.query(
      "INSERT INTO stats (value, label, display_order) VALUES ($1, $2, $3)",
      [s.value, s.label, s.display_order]
    );
  }
}

export async function getStats() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    "SELECT * FROM stats ORDER BY display_order ASC, id ASC"
  );
  return rows;
}

export async function getStat(id) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM stats WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createStat({ value, label, displayOrder }) {
  await ensureTable();
  await db.query(
    "INSERT INTO stats (value, label, display_order) VALUES ($1, $2, $3)",
    [value, label, displayOrder || 0]
  );
}

export async function updateStat(id, { value, label, displayOrder }) {
  await ensureTable();
  await db.query(
    "UPDATE stats SET value = $1, label = $2, display_order = $3, updated_at = now() WHERE id = $4",
    [value, label, displayOrder || 0, id]
  );
}

export async function deleteStat(id) {
  await ensureTable();
  await db.query("DELETE FROM stats WHERE id = $1", [id]);
}
