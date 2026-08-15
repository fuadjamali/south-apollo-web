import { db } from "@/lib/db";
import { ensureTeamsTable, getTeams } from "@/lib/teams";

async function ensureTable() {
  // FK dependency — teams must exist before team_members can reference it.
  await ensureTeamsTable();
  await db.query(`
    CREATE TABLE IF NOT EXISTS team_members (
      id SERIAL PRIMARY KEY,
      id_no VARCHAR(50),
      name VARCHAR(255) NOT NULL,
      title VARCHAR(255),
      contact_no VARCHAR(50),
      email VARCHAR(255),
      service_join_date DATE,
      service_end_date DATE,
      team_id INT REFERENCES teams(id) ON DELETE CASCADE,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function seedIfEmpty() {
  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM team_members");
  if (rows[0].count > 0) return;

  const teams = await getTeams();
  const firstTeam = teams[0];
  if (!firstTeam) return;

  const DEFAULT_MEMBERS = [
    { id_no: "EMP-001", name: "TEAM_MEMBER_1_NAME", title: "TEAM_MEMBER_1_TITLE" },
    { id_no: "EMP-002", name: "TEAM_MEMBER_2_NAME", title: "TEAM_MEMBER_2_TITLE" },
  ];

  for (const m of DEFAULT_MEMBERS) {
    await db.query(
      `INSERT INTO team_members (id_no, name, title, team_id, active)
       VALUES ($1, $2, $3, $4, true)`,
      [m.id_no, m.name, m.title, firstTeam.id]
    );
  }
}

// Admin list — every member (active and inactive), with the parent team name joined in.
export async function getTeamMembers() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(`
    SELECT tm.*, t.name AS team_name
    FROM team_members tm
    LEFT JOIN teams t ON t.id = tm.team_id
    ORDER BY t.display_order ASC NULLS LAST, tm.name ASC
  `);
  return rows;
}

export async function getTeamMember(id) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM team_members WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createTeamMember({
  idNo,
  name,
  title,
  contactNo,
  email,
  serviceJoinDate,
  serviceEndDate,
  teamId,
  active,
}) {
  await ensureTable();
  await db.query(
    `INSERT INTO team_members
       (id_no, name, title, contact_no, email, service_join_date, service_end_date, team_id, active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      idNo || null,
      name,
      title || null,
      contactNo || null,
      email || null,
      serviceJoinDate || null,
      serviceEndDate || null,
      teamId || null,
      active,
    ]
  );
}

export async function updateTeamMember(
  id,
  { idNo, name, title, contactNo, email, serviceJoinDate, serviceEndDate, teamId, active }
) {
  await ensureTable();
  await db.query(
    `UPDATE team_members
     SET id_no = $1, name = $2, title = $3, contact_no = $4, email = $5,
         service_join_date = $6, service_end_date = $7, team_id = $8, active = $9, updated_at = now()
     WHERE id = $10`,
    [
      idNo || null,
      name,
      title || null,
      contactNo || null,
      email || null,
      serviceJoinDate || null,
      serviceEndDate || null,
      teamId || null,
      active,
      id,
    ]
  );
}

export async function deleteTeamMember(id) {
  await ensureTable();
  await db.query("DELETE FROM team_members WHERE id = $1", [id]);
}

// Public "Meet our team" section — active members only, grouped by team, in team display order.
export async function getActiveTeamsWithMembers() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(`
    SELECT t.id AS team_id, t.name AS team_name, t.display_order,
           tm.id AS member_id, tm.name AS member_name, tm.title AS member_title
    FROM teams t
    JOIN team_members tm ON tm.team_id = t.id AND tm.active = true
    ORDER BY t.display_order ASC, t.id ASC, tm.name ASC
  `);

  const teamsMap = new Map();
  for (const row of rows) {
    if (!teamsMap.has(row.team_id)) {
      teamsMap.set(row.team_id, { id: row.team_id, name: row.team_name, members: [] });
    }
    teamsMap.get(row.team_id).members.push({
      id: row.member_id,
      name: row.member_name,
      title: row.member_title,
    });
  }
  return [...teamsMap.values()];
}
