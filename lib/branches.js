import { db } from "@/lib/db";

// The clinic's branches (home "Our Branches" section, admin /admin/branches). Visitor-facing
// text is bilingual in its own columns, like the doctor directory. `phones` holds the same
// labelled one-per-line format as Contact Us ("Hotline: 09617-888892", "Mobile: 01711-457444,
// …") and is parsed with lib/contactInfo.js's parsePhoneLines.
async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS branches (
        id SERIAL PRIMARY KEY,
        name_en VARCHAR(255) NOT NULL,
        name_bn VARCHAR(255),
        intro_en TEXT,
        intro_bn TEXT,
        address_en TEXT,
        address_bn TEXT,
        phones TEXT,
        map_query TEXT,
        is_main BOOLEAN NOT NULL DEFAULT false,
        display_order INT NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT true,
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

// Main branch first, then display order.
const ORDER = "ORDER BY is_main DESC, display_order ASC, id ASC";

export async function getActiveBranches() {
  await ensureTable();
  const { rows } = await db.query(`SELECT * FROM branches WHERE active ${ORDER}`);
  return rows;
}

export async function getAllBranches() {
  await ensureTable();
  const { rows } = await db.query(`SELECT * FROM branches ${ORDER}`);
  return rows;
}

export async function getBranch(id) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM branches WHERE id = $1", [id]);
  return rows[0] || null;
}

const FIELDS = [
  "name_en",
  "name_bn",
  "intro_en",
  "intro_bn",
  "address_en",
  "address_bn",
  "phones",
  "map_query",
  "is_main",
  "display_order",
  "active",
];

function values(data) {
  return FIELDS.map((f) => {
    if (f === "is_main") return data.is_main === true;
    if (f === "active") return data.active !== false;
    if (f === "display_order") return data.display_order || 0;
    return data[f] ? data[f] : null;
  });
}

// Only one branch can be the main one — saving one as main clears the flag on the others.
async function clearOtherMain(exceptId) {
  await db.query("UPDATE branches SET is_main = false WHERE is_main AND id IS DISTINCT FROM $1", [exceptId]);
}

export async function createBranch(data) {
  await ensureTable();
  const { rows } = await db.query(
    `INSERT INTO branches (${FIELDS.join(", ")})
     VALUES (${FIELDS.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING id`,
    values(data)
  );
  if (data.is_main) await clearOtherMain(rows[0].id);
}

export async function updateBranch(id, data) {
  await ensureTable();
  await db.query(
    `UPDATE branches SET ${FIELDS.map((f, i) => `${f} = $${i + 1}`).join(", ")}, updated_at = now()
     WHERE id = $${FIELDS.length + 1}`,
    [...values(data), id]
  );
  if (data.is_main) await clearOtherMain(Number(id));
}

export async function deleteBranch(id) {
  await ensureTable();
  await db.query("DELETE FROM branches WHERE id = $1", [id]);
}

// Google Maps link for "Get directions" — the admin's map query if set (a place name Google
// knows, e.g. the clinic's listing), otherwise the English address.
export function directionsHref(branch) {
  const q = branch.map_query || branch.address_en;
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null;
}
