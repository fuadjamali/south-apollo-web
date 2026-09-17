import { db } from "@/lib/db";

// Person directory — entered once, then assigned to any number of teams via team_members
// (lib/teamMembers.js), which is a pure join row (title/dates/flags for one membership) rather
// than a copy of the person. This is what lets the same person sit on this year's Executive
// Committee and last year's (now Former) without re-entering their name or re-uploading their
// photo. See docs/team-people-internals.md for the full design writeup this was built from.
export async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS people (
        id SERIAL PRIMARY KEY,
        id_no VARCHAR(50),
        name VARCHAR(255) NOT NULL,
        contact_no VARCHAR(50),
        email VARCHAR(255),
        photo VARCHAR(500),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    // See lib/productPhotos.js's ensureTable comment — concurrent first-time
    // "CREATE TABLE IF NOT EXISTS" callers can race under Postgres (the build's static-page
    // generation hits this table from several routes' pages in parallel on a cold database).
    if (err.code !== "23505" && err.code !== "42P07") throw err;
  }
}

// No unique constraint on `name` — two real people can genuinely share one, so it can't be a
// hard block. The admin form (components/PersonForm.js) instead warns on submit via a
// same-name confirm() prompt, using getPeople()'s full list to check against client-side.
export async function getPeople() {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM people ORDER BY name ASC");
  return rows;
}

export async function getPerson(id) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM people WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createPerson({ idNo, name, contactNo, email, photo }) {
  await ensureTable();
  const { rows } = await db.query(
    "INSERT INTO people (id_no, name, contact_no, email, photo) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [idNo || null, name, contactNo || null, email || null, photo || null]
  );
  return rows[0];
}

export async function updatePerson(id, { idNo, name, contactNo, email, photo }) {
  await ensureTable();
  await db.query(
    `UPDATE people SET id_no = $1, name = $2, contact_no = $3, email = $4, photo = $5, updated_at = now()
     WHERE id = $6`,
    [idNo || null, name, contactNo || null, email || null, photo || null, id]
  );
}

// team_members.person_id is ON DELETE CASCADE — deleting a person deletes every one of their
// team memberships with them. The admin UI's confirm dialog warns about this before calling this.
export async function deletePerson(id) {
  await ensureTable();
  await db.query("DELETE FROM people WHERE id = $1", [id]);
}
