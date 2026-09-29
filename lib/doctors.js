import { db } from "@/lib/db";

// Doctor directory (public /doctors, admin /admin/doctors). Every visitor-facing text field has
// an English and a Bangla column side by side — unlike the JSONB `translations` used for short
// interface labels elsewhere, a doctor's whole profile is bilingual content in its own right, and
// the finder searches both languages at once regardless of which one the page is showing.
//
// Specialties carry the symptom/disease keywords (one per line, both languages) that let a
// patient who doesn't know which kind of doctor they need find one by describing the problem.
async function ensureTables() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS doctor_specialties (
        id SERIAL PRIMARY KEY,
        name_en VARCHAR(255) NOT NULL,
        name_bn VARCHAR(255),
        keywords_en TEXT,
        keywords_bn TEXT,
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
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        name_en VARCHAR(255),
        name_bn VARCHAR(255),
        degrees_en TEXT,
        degrees_bn TEXT,
        designation_en TEXT,
        designation_bn TEXT,
        expertise_en TEXT,
        expertise_bn TEXT,
        schedule_en TEXT,
        schedule_bn TEXT,
        specialty_id INT REFERENCES doctor_specialties(id) ON DELETE SET NULL,
        room VARCHAR(100),
        fee INT,
        serial_phone VARCHAR(100),
        photo VARCHAR(500),
        display_order INT NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    if (err.code !== "23505" && err.code !== "42P07") throw err;
  }
  // Added once the client's sheet arrived: each doctor's own symptom keywords (on top of their
  // specialty's) and whether they offer online consultations.
  await db.query("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS keywords_en TEXT");
  await db.query("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS keywords_bn TEXT");
  await db.query("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS telehealth BOOLEAN NOT NULL DEFAULT false");
}

const DOCTOR_SELECT = `
  SELECT d.*, s.name_en AS specialty_en, s.name_bn AS specialty_bn,
         s.keywords_en AS specialty_keywords_en, s.keywords_bn AS specialty_keywords_bn
  FROM doctors d
  LEFT JOIN doctor_specialties s ON s.id = d.specialty_id`;

const DOCTOR_ORDER = "ORDER BY d.display_order ASC, s.display_order ASC NULLS LAST, d.id ASC";

// Columns safe to send to the browser — every place that needs the directory client-side (the
// /doctors page's search, the home preview, and the site-wide chat widget) needs exactly these
// to search and render; nothing else about a doctor row (no created_at/updated_at etc). Kept as
// one shared allowlist rather than copied per call site, so a new sensitive column added later
// doesn't get exposed just because one copy was missed.
export const PUBLIC_DOCTOR_FIELDS = [
  "id", "name_en", "name_bn", "degrees_en", "degrees_bn", "designation_en", "designation_bn",
  "expertise_en", "expertise_bn", "schedule_en", "schedule_bn", "specialty_id", "specialty_en",
  "specialty_bn", "specialty_keywords_en", "specialty_keywords_bn", "room", "fee", "serial_phone",
  "photo", "display_order", "keywords_en", "keywords_bn", "telehealth",
];

export function toPublicDoctor(row) {
  return Object.fromEntries(PUBLIC_DOCTOR_FIELDS.map((f) => [f, row[f] ?? null]));
}

export function toPublicSpecialty({ id, name_en, name_bn, keywords_en, keywords_bn }) {
  return { id, name_en, name_bn, keywords_en, keywords_bn };
}

export async function getActiveDoctors() {
  await ensureTables();
  const { rows } = await db.query(`${DOCTOR_SELECT} WHERE d.active ${DOCTOR_ORDER}`);
  return rows;
}

export async function getAllDoctors() {
  await ensureTables();
  const { rows } = await db.query(`${DOCTOR_SELECT} ${DOCTOR_ORDER}`);
  return rows;
}

export async function getDoctor(id) {
  await ensureTables();
  const { rows } = await db.query(`${DOCTOR_SELECT} WHERE d.id = $1`, [id]);
  return rows[0] || null;
}

const DOCTOR_FIELDS = [
  "name_en",
  "name_bn",
  "degrees_en",
  "degrees_bn",
  "designation_en",
  "designation_bn",
  "expertise_en",
  "expertise_bn",
  "schedule_en",
  "schedule_bn",
  "keywords_en",
  "keywords_bn",
  "specialty_id",
  "room",
  "fee",
  "serial_phone",
  "photo",
  "display_order",
  "active",
  "telehealth",
];

// `data` uses the column names above; empty strings are stored as NULL so "not given" is one
// state, not two.
function doctorValues(data) {
  return DOCTOR_FIELDS.map((field) => {
    const value = data[field];
    if (field === "active") return value !== false;
    if (field === "telehealth") return value === true;
    if (field === "display_order") return value || 0;
    return value === "" || value === undefined ? null : value;
  });
}

export async function createDoctor(data) {
  await ensureTables();
  await db.query(
    `INSERT INTO doctors (${DOCTOR_FIELDS.join(", ")})
     VALUES (${DOCTOR_FIELDS.map((_, i) => `$${i + 1}`).join(", ")})`,
    doctorValues(data)
  );
}

export async function updateDoctor(id, data) {
  await ensureTables();
  await db.query(
    `UPDATE doctors SET ${DOCTOR_FIELDS.map((f, i) => `${f} = $${i + 1}`).join(", ")}, updated_at = now()
     WHERE id = $${DOCTOR_FIELDS.length + 1}`,
    [...doctorValues(data), id]
  );
}

export async function deleteDoctor(id) {
  await ensureTables();
  await db.query("DELETE FROM doctors WHERE id = $1", [id]);
}

// Drag-and-drop reorder from /admin/doctors (NavReorderableList, same pattern as
// lib/heroSlides.js's setHeroSlideOrder) — assigns 1..N in the given order. Only meaningful for
// the full, unfiltered list: reordering a filtered subset would renumber just those doctors and
// interleave oddly with the ones left out, so the admin page only offers dragging there.
export async function setDoctorOrder(orderedIds) {
  await ensureTables();
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    for (let i = 0; i < orderedIds.length; i++) {
      await client.query("UPDATE doctors SET display_order = $1, updated_at = now() WHERE id = $2", [
        i + 1,
        orderedIds[i],
      ]);
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ---------- Specialties ----------

export async function getSpecialties() {
  await ensureTables();
  const { rows } = await db.query(`
    SELECT s.*, COUNT(d.id)::int AS doctor_count
    FROM doctor_specialties s
    LEFT JOIN doctors d ON d.specialty_id = s.id AND d.active
    GROUP BY s.id
    ORDER BY s.display_order ASC, s.name_en ASC`);
  return rows;
}

export async function getSpecialty(id) {
  await ensureTables();
  const { rows } = await db.query("SELECT * FROM doctor_specialties WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createSpecialty({ nameEn, nameBn, keywordsEn, keywordsBn, displayOrder }) {
  await ensureTables();
  await db.query(
    `INSERT INTO doctor_specialties (name_en, name_bn, keywords_en, keywords_bn, display_order)
     VALUES ($1, $2, $3, $4, $5)`,
    [nameEn, nameBn || null, keywordsEn || null, keywordsBn || null, displayOrder || 0]
  );
}

export async function updateSpecialty(id, { nameEn, nameBn, keywordsEn, keywordsBn, displayOrder }) {
  await ensureTables();
  await db.query(
    `UPDATE doctor_specialties
     SET name_en = $1, name_bn = $2, keywords_en = $3, keywords_bn = $4, display_order = $5,
         updated_at = now()
     WHERE id = $6`,
    [nameEn, nameBn || null, keywordsEn || null, keywordsBn || null, displayOrder || 0, id]
  );
}

// Doctors in a deleted specialty stay listed, just without one (ON DELETE SET NULL).
export async function deleteSpecialty(id) {
  await ensureTables();
  await db.query("DELETE FROM doctor_specialties WHERE id = $1", [id]);
}
