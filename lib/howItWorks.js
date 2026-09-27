import { db } from "@/lib/db";
import { HOW_IT_WORKS_ICON_KEYS } from "@/lib/howItWorksIcons";

async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS how_it_works_steps (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
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
  // Nullable, no default — an existing step with no icon set falls back to its plain numbered
  // circle (app/page.js), so this is a purely additive visual upgrade, not a forced re-edit.
  await db.query(`ALTER TABLE how_it_works_steps ADD COLUMN IF NOT EXISTS icon VARCHAR(30)`);
}

// Same placeholder content that used to live in config/site.js.
const DEFAULT_STEPS = [
  { title: "STEP_1_TITLE", description: "STEP_1_DESCRIPTION", display_order: 1 },
  { title: "STEP_2_TITLE", description: "STEP_2_DESCRIPTION", display_order: 2 },
  { title: "STEP_3_TITLE", description: "STEP_3_DESCRIPTION", display_order: 3 },
];

async function seedIfEmpty() {
  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM how_it_works_steps");
  if (rows[0].count > 0) return;

  for (const s of DEFAULT_STEPS) {
    await db.query(
      "INSERT INTO how_it_works_steps (title, description, display_order) VALUES ($1, $2, $3)",
      [s.title, s.description, s.display_order]
    );
  }
}

export async function getSteps() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    "SELECT * FROM how_it_works_steps ORDER BY display_order ASC, id ASC"
  );
  return rows;
}

export async function getStep(id) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM how_it_works_steps WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createStep({ title, description, displayOrder, icon }) {
  await ensureTable();
  await db.query(
    "INSERT INTO how_it_works_steps (title, description, display_order, icon) VALUES ($1, $2, $3, $4)",
    [title, description || null, displayOrder || 0, HOW_IT_WORKS_ICON_KEYS.includes(icon) ? icon : null]
  );
}

export async function updateStep(id, { title, description, displayOrder, icon }) {
  await ensureTable();
  await db.query(
    "UPDATE how_it_works_steps SET title = $1, description = $2, display_order = $3, icon = $4, updated_at = now() WHERE id = $5",
    [
      title,
      description || null,
      displayOrder || 0,
      HOW_IT_WORKS_ICON_KEYS.includes(icon) ? icon : null,
      id,
    ]
  );
}

export async function deleteStep(id) {
  await ensureTable();
  await db.query("DELETE FROM how_it_works_steps WHERE id = $1", [id]);
}
