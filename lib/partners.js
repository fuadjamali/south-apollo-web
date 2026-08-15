import { db } from "@/lib/db";

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS partners (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      logo VARCHAR(500),
      description TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'Active'
        CHECK (status IN ('Active', 'Inactive')),
      partnership_from DATE,
      partnership_ended DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

// Same placeholder-content convention as every other CRUD section.
const DEFAULT_PARTNERS = [
  {
    name: "PARTNER_1_NAME",
    logo: "/logos/trustpilot.svg",
    description: "PARTNER_1_DESCRIPTION",
    status: "Active",
  },
];

async function seedIfEmpty() {
  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM partners");
  if (rows[0].count > 0) return;

  for (const p of DEFAULT_PARTNERS) {
    await db.query(
      "INSERT INTO partners (name, logo, description, status) VALUES ($1, $2, $3, $4)",
      [p.name, p.logo, p.description, p.status]
    );
  }
}

export async function getPartners() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query("SELECT * FROM partners ORDER BY name ASC");
  return rows;
}

export async function getPartner(id) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM partners WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createPartner({
  name,
  logo,
  description,
  status,
  partnershipFrom,
  partnershipEnded,
}) {
  await ensureTable();
  await db.query(
    `INSERT INTO partners (name, logo, description, status, partnership_from, partnership_ended)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      name,
      logo || null,
      description || null,
      status,
      partnershipFrom || null,
      partnershipEnded || null,
    ]
  );
}

export async function updatePartner(
  id,
  { name, logo, description, status, partnershipFrom, partnershipEnded }
) {
  await ensureTable();
  await db.query(
    `UPDATE partners
     SET name = $1, logo = $2, description = $3, status = $4,
         partnership_from = $5, partnership_ended = $6, updated_at = now()
     WHERE id = $7`,
    [
      name,
      logo || null,
      description || null,
      status,
      partnershipFrom || null,
      partnershipEnded || null,
      id,
    ]
  );
}

export async function deletePartner(id) {
  await ensureTable();
  await db.query("DELETE FROM partners WHERE id = $1", [id]);
}

// Public "Trusted By" strip — active partners only, alphabetical.
export async function getActivePartners() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    "SELECT * FROM partners WHERE status = 'Active' ORDER BY name ASC"
  );
  return rows;
}
