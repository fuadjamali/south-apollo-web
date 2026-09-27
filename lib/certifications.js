import { db } from "@/lib/db";

async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS certifications (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image VARCHAR(500),
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

// Same placeholder-content convention as elsewhere — migrated off the static
// config/site.js `certifications.items` array so a fresh install still shows something.
const DEFAULT_ITEMS = [
  { name: "CERTIFICATION_1_NAME", display_order: 1 },
  { name: "CERTIFICATION_2_NAME", display_order: 2 },
  { name: "CERTIFICATION_3_NAME", display_order: 3 },
];

async function seedIfEmpty() {
  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM certifications");
  if (rows[0].count > 0) return;

  for (const c of DEFAULT_ITEMS) {
    await db.query("INSERT INTO certifications (name, display_order) VALUES ($1, $2)", [
      c.name,
      c.display_order,
    ]);
  }
}

export async function getCertifications() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    "SELECT * FROM certifications ORDER BY display_order ASC, id ASC"
  );
  return rows;
}

export async function getCertification(id) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM certifications WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createCertification({ name, image, displayOrder }) {
  await ensureTable();
  await db.query(
    "INSERT INTO certifications (name, image, display_order) VALUES ($1, $2, $3)",
    [name, image || null, displayOrder || 0]
  );
}

export async function updateCertification(id, { name, image, displayOrder }) {
  await ensureTable();
  await db.query(
    "UPDATE certifications SET name = $1, image = $2, display_order = $3, updated_at = now() WHERE id = $4",
    [name, image || null, displayOrder || 0, id]
  );
}

export async function deleteCertification(id) {
  await ensureTable();
  await db.query("DELETE FROM certifications WHERE id = $1", [id]);
}
