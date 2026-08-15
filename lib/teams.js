import { db } from "@/lib/db";

// Exported (not just internal) because lib/teamMembers.js's team_members table has a foreign
// key to teams — its ensureTable() must guarantee this table exists first.
export async function ensureTeamsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      display_order INT NOT NULL DEFAULT 0,
      show_on_home BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  // Schema migration for tables created before this column existed. Defaults to true so
  // existing teams keep showing on home exactly as before this feature was added.
  await db.query(`ALTER TABLE teams ADD COLUMN IF NOT EXISTS show_on_home BOOLEAN NOT NULL DEFAULT true;`);
}

// Same placeholder-content convention as products/blog/reviews, so a fresh install's
// "Meet our team" section isn't empty.
const DEFAULT_TEAMS = [
  { name: "TEAM_1_NAME", description: "TEAM_1_DESCRIPTION", display_order: 1 },
];

async function seedIfEmpty() {
  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM teams");
  if (rows[0].count > 0) return;

  for (const t of DEFAULT_TEAMS) {
    await db.query(
      "INSERT INTO teams (name, description, display_order) VALUES ($1, $2, $3)",
      [t.name, t.description, t.display_order]
    );
  }
}

export async function getTeams() {
  await ensureTeamsTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    "SELECT * FROM teams ORDER BY display_order ASC, id ASC"
  );
  return rows;
}

export async function getTeam(id) {
  await ensureTeamsTable();
  const { rows } = await db.query("SELECT * FROM teams WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createTeam({ name, description, displayOrder, showOnHome }) {
  await ensureTeamsTable();
  await db.query(
    "INSERT INTO teams (name, description, display_order, show_on_home) VALUES ($1, $2, $3, $4)",
    [name, description || null, displayOrder || 0, showOnHome]
  );
}

export async function updateTeam(id, { name, description, displayOrder, showOnHome }) {
  await ensureTeamsTable();
  await db.query(
    `UPDATE teams
     SET name = $1, description = $2, display_order = $3, show_on_home = $4, updated_at = now()
     WHERE id = $5`,
    [name, description || null, displayOrder || 0, showOnHome, id]
  );
}

// team_members.team_id has ON DELETE CASCADE — deleting a team deletes its members too.
// The admin UI warns about this in the delete confirmation before calling this.
export async function deleteTeam(id) {
  await ensureTeamsTable();
  await db.query("DELETE FROM teams WHERE id = $1", [id]);
}
