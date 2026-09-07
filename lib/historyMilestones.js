import { db } from "@/lib/db";

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS history_milestones (
      id SERIAL PRIMARY KEY,
      year VARCHAR(20) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

export async function getMilestones() {
  await ensureTable();
  const { rows } = await db.query(
    "SELECT * FROM history_milestones ORDER BY display_order ASC, id ASC"
  );
  return rows;
}

export async function getMilestone(id) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM history_milestones WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createMilestone({ year, title, description, displayOrder }) {
  await ensureTable();
  await db.query(
    "INSERT INTO history_milestones (year, title, description, display_order) VALUES ($1, $2, $3, $4)",
    [year, title, description || null, displayOrder || 0]
  );
}

export async function updateMilestone(id, { year, title, description, displayOrder }) {
  await ensureTable();
  await db.query(
    "UPDATE history_milestones SET year = $1, title = $2, description = $3, display_order = $4, updated_at = now() WHERE id = $5",
    [year, title, description || null, displayOrder || 0, id]
  );
}

export async function deleteMilestone(id) {
  await ensureTable();
  await db.query("DELETE FROM history_milestones WHERE id = $1", [id]);
}
