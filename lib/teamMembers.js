import { db } from "@/lib/db";
import { ensureTeamsTable, getTeams } from "@/lib/teams";
import { ensureTable as ensurePeopleTable, createPerson } from "@/lib/people";

// team_members didn't start as a pure join — it used to *be* the person record (name/photo/
// contact lived directly on it, one row per person per team, duplicated across every
// membership). The columns below the FK dependency comment are that legacy shape: never
// dropped (additive-only schema, same convention as every other table in this codebase), but
// no longer written to by createTeamMember/updateTeamMember — every read below joins through
// people instead. See docs/team-people-internals.md for the full design writeup.
async function ensureTable() {
  // FK dependencies — people and teams must exist before team_members can reference them.
  await ensurePeopleTable();
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
      show_on_home BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  // Schema migration for tables created before this column existed. Defaults to true so
  // existing members keep showing on home exactly as before this feature was added.
  await db.query(`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS show_on_home BOOLEAN NOT NULL DEFAULT true;`);
  await db.query(`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS photo VARCHAR(500);`);
  // The people split. Nullable — existing rows have no person yet until backfillPeople() (below)
  // runs — and NOT dropped from `name`/`photo`/etc above, per this codebase's additive-only rule.
  await db.query(`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS person_id INT REFERENCES people(id) ON DELETE CASCADE;`);
  // Left early while their team is still current — independent of teams.is_former (lib/teams.js).
  await db.query(`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS is_former BOOLEAN NOT NULL DEFAULT false;`);

  await backfillPeople();
}

// One-time, advisory-lock-guarded backfill: turns every pre-people-split row (person_id IS NULL)
// into its own `people` row, using whichever name/photo/contact/id_no/email it already had.
// Idempotent — once every row has a person_id, the SELECT returns nothing and this is a no-op on
// every subsequent call, same shape as lib/partners.js's backfillDisplayOrder(). Skippable
// entirely on a fresh install (there's nothing to migrate, so the loop body never runs).
async function backfillPeople() {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('team_members:people_backfill'))");
    const { rows } = await client.query(
      "SELECT id, id_no, name, contact_no, email, photo FROM team_members WHERE person_id IS NULL"
    );
    for (const row of rows) {
      const {
        rows: [person],
      } = await client.query(
        "INSERT INTO people (id_no, name, contact_no, email, photo) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [row.id_no, row.name, row.contact_no, row.email, row.photo]
      );
      await client.query("UPDATE team_members SET person_id = $1 WHERE id = $2", [person.id, row.id]);
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
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
    const person = await createPerson({ idNo: m.id_no, name: m.name });
    await db.query(
      `INSERT INTO team_members (id_no, name, title, team_id, active, person_id)
       VALUES ($1, $2, $3, $4, true, $5)`,
      [m.id_no, m.name, m.title, firstTeam.id, person.id]
    );
  }
}

// Every read below joins through `people` for name/photo/id_no/contact_no/email, aliased back
// to the plain field names (person_name -> name, etc.) so existing consumers of these rows
// don't need to change — same "keep the read shape stable" convention lib/reviews.js's
// toPublicShape() uses for its own historical field rename.
const MEMBER_SELECT = `
  SELECT tm.id, tm.title, tm.service_join_date, tm.service_end_date, tm.team_id,
         tm.active, tm.show_on_home, tm.is_former, tm.person_id,
         tm.created_at, tm.updated_at,
         p.id_no AS id_no, p.name AS name, p.contact_no AS contact_no, p.email AS email, p.photo AS photo,
         t.name AS team_name, t.is_former AS team_is_former
  FROM team_members tm
  LEFT JOIN people p ON p.id = tm.person_id
  LEFT JOIN teams t ON t.id = tm.team_id
`;

// Admin list — every member (active and inactive), with the parent team name joined in.
export async function getTeamMembers() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    `${MEMBER_SELECT} ORDER BY t.display_order ASC NULLS LAST, p.name ASC`
  );
  return rows;
}

export async function getTeamMember(id) {
  await ensureTable();
  const { rows } = await db.query(`${MEMBER_SELECT} WHERE tm.id = $1`, [id]);
  return rows[0] || null;
}

// Refuses a second *active* membership for the same person on the same team — an
// application-level check, not a database constraint, specifically so it can't take the whole
// table down if a pre-existing duplicate is already sitting in production data unnoticed.
async function hasActiveDuplicateMembership(personId, teamId, excludeId) {
  const { rows } = await db.query(
    `SELECT id FROM team_members
     WHERE person_id = $1 AND team_id = $2 AND active = true AND id IS DISTINCT FROM $3
     LIMIT 1`,
    [personId, teamId, excludeId || null]
  );
  return rows.length > 0;
}

export async function createTeamMember({
  personId,
  title,
  serviceJoinDate,
  serviceEndDate,
  teamId,
  active,
  showOnHome,
  isFormer,
}) {
  await ensureTable();
  if (await hasActiveDuplicateMembership(personId, teamId, null)) {
    throw new Error("duplicate");
  }
  await db.query(
    `INSERT INTO team_members (person_id, team_id, title, service_join_date, service_end_date, active, show_on_home, is_former, name)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, (SELECT name FROM people WHERE id = $1))`,
    [
      personId,
      teamId || null,
      title || null,
      serviceJoinDate || null,
      serviceEndDate || null,
      active,
      showOnHome,
      isFormer || false,
    ]
  );
}

export async function updateTeamMember(
  id,
  { personId, title, serviceJoinDate, serviceEndDate, teamId, active, showOnHome, isFormer }
) {
  await ensureTable();
  if (await hasActiveDuplicateMembership(personId, teamId, id)) {
    throw new Error("duplicate");
  }
  await db.query(
    `UPDATE team_members
     SET person_id = $1, team_id = $2, title = $3, service_join_date = $4, service_end_date = $5,
         active = $6, show_on_home = $7, is_former = $8, updated_at = now()
     WHERE id = $9`,
    [
      personId,
      teamId || null,
      title || null,
      serviceJoinDate || null,
      serviceEndDate || null,
      active,
      showOnHome,
      isFormer || false,
      id,
    ]
  );
}

export async function deleteTeamMember(id) {
  await ensureTable();
  await db.query("DELETE FROM team_members WHERE id = $1", [id]);
}

function groupByTeam(rows) {
  const teamsMap = new Map();
  for (const row of rows) {
    if (!teamsMap.has(row.team_id)) {
      teamsMap.set(row.team_id, { id: row.team_id, name: row.team_name, members: [] });
    }
    teamsMap.get(row.team_id).members.push({
      id: row.member_id,
      name: row.member_name,
      title: row.member_title,
      photo: row.member_photo,
    });
  }
  return [...teamsMap.values()];
}

// Home page "Meet our team" section — the strictest query here: only teams AND members that
// have both opted in via "Show on home", only active members, and non-former at *both* levels —
// belt-and-suspenders, since the home page should never show a former committee even if an
// admin forgot to also flip that team's own "Show on home" off.
export async function getActiveTeamsWithMembers() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(`
    SELECT t.id AS team_id, t.name AS team_name, t.display_order,
           tm.id AS member_id, p.name AS member_name, tm.title AS member_title, p.photo AS member_photo
    FROM teams t
    JOIN team_members tm ON tm.team_id = t.id AND tm.active = true AND tm.show_on_home = true AND tm.is_former = false
    LEFT JOIN people p ON p.id = tm.person_id
    WHERE t.show_on_home = true AND t.is_former = false
    ORDER BY t.display_order ASC, t.id ASC, p.name ASC
  `);
  return groupByTeam(rows);
}

// Full /team page, current roster — every team, every active member, regardless of the
// home-page "Show on home" opt-in; excludes anything former at either level (that's
// getFormerTeamsWithMembers() below instead).
export async function getCurrentTeamsWithMembers() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(`
    SELECT t.id AS team_id, t.name AS team_name, t.display_order,
           tm.id AS member_id, p.name AS member_name, tm.title AS member_title, p.photo AS member_photo
    FROM teams t
    JOIN team_members tm ON tm.team_id = t.id AND tm.active = true AND tm.is_former = false
    LEFT JOIN people p ON p.id = tm.person_id
    WHERE t.is_former = false
    ORDER BY t.display_order ASC, t.id ASC, p.name ASC
  `);
  return groupByTeam(rows);
}

// Full /team page, former roster — a team whose own term ended (t.is_former), OR a member who
// left early while their team is still current (tm.is_former). Only ever returns a group for a
// team that actually has at least one effectively-former member, so the public nav never offers
// an empty "Former X" view with nothing in it (see components/TeamRoster.js).
export async function getFormerTeamsWithMembers() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(`
    SELECT t.id AS team_id, t.name AS team_name, t.display_order,
           tm.id AS member_id, p.name AS member_name, tm.title AS member_title, p.photo AS member_photo
    FROM teams t
    JOIN team_members tm ON tm.team_id = t.id AND tm.active = true AND (t.is_former = true OR tm.is_former = true)
    LEFT JOIN people p ON p.id = tm.person_id
    ORDER BY t.display_order ASC, t.id ASC, p.name ASC
  `);
  return groupByTeam(rows);
}
