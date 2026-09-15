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
  // Added after the table already shipped — same ALTER TABLE ADD COLUMN IF NOT EXISTS pattern as
  // everywhere else. display_order defaults every existing row to 0, which would leave them tied
  // (Postgres then breaks ties arbitrarily) — backfillDisplayOrder() below fixes that up once,
  // right after these columns first appear, so nothing visibly reorders on deploy.
  await db.query(`ALTER TABLE partners ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0`);
  await db.query(`ALTER TABLE partners ADD COLUMN IF NOT EXISTS link_url VARCHAR(500)`);
}

// One-time fixup for deployments that already had partners before display_order existed: every
// row starts at the column's default (0), so without this they'd all tie and Postgres would sort
// them in whatever order it pleases instead of the alphabetical order they used to render in.
// Only fires when every row is still untouched (all zero) — an admin who has already set orders
// (including deliberately setting more than one to 0) is never overridden.
async function backfillDisplayOrder() {
  const { rows } = await db.query(
    "SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE display_order != 0)::int AS nonzero FROM partners"
  );
  if (rows[0].total <= 1 || rows[0].nonzero > 0) return;

  const { rows: ordered } = await db.query("SELECT id FROM partners ORDER BY name ASC");
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    for (let i = 0; i < ordered.length; i++) {
      await client.query("UPDATE partners SET display_order = $1 WHERE id = $2", [i + 1, ordered[i].id]);
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
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
      "INSERT INTO partners (name, logo, description, status, display_order) VALUES ($1, $2, $3, $4, 1)",
      [p.name, p.logo, p.description, p.status]
    );
  }
}

export async function getPartners() {
  await ensureTable();
  await seedIfEmpty();
  await backfillDisplayOrder();
  const { rows } = await db.query("SELECT * FROM partners ORDER BY display_order ASC, id ASC");
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
  displayOrder,
  linkUrl,
}) {
  await ensureTable();
  await db.query(
    `INSERT INTO partners
       (name, logo, description, status, partnership_from, partnership_ended, display_order, link_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      name,
      logo || null,
      description || null,
      status,
      partnershipFrom || null,
      partnershipEnded || null,
      displayOrder || 0,
      linkUrl || null,
    ]
  );
}

export async function updatePartner(
  id,
  { name, logo, description, status, partnershipFrom, partnershipEnded, displayOrder, linkUrl }
) {
  await ensureTable();
  await db.query(
    `UPDATE partners
     SET name = $1, logo = $2, description = $3, status = $4,
         partnership_from = $5, partnership_ended = $6, display_order = $7, link_url = $8,
         updated_at = now()
     WHERE id = $9`,
    [
      name,
      logo || null,
      description || null,
      status,
      partnershipFrom || null,
      partnershipEnded || null,
      displayOrder || 0,
      linkUrl || null,
      id,
    ]
  );
}

export async function deletePartner(id) {
  await ensureTable();
  await db.query("DELETE FROM partners WHERE id = $1", [id]);
}

// Public "Trusted By" strip — active partners only, admin-ordered.
export async function getActivePartners() {
  await ensureTable();
  await seedIfEmpty();
  await backfillDisplayOrder();
  const { rows } = await db.query(
    "SELECT * FROM partners WHERE status = 'Active' ORDER BY display_order ASC, id ASC"
  );
  return rows;
}
