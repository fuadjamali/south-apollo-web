import { db } from "@/lib/db";

async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS portfolio_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        description TEXT,
        image VARCHAR(500) NOT NULL,
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

// Same placeholder-content convention as gallery/products/etc — migrated off the static
// config/site.js `portfolio.items` array so a fresh install still shows something.
const DEFAULT_ITEMS = [
  { image: "/images/portfolio-1.jpg", name: "PORTFOLIO_1_NAME", display_order: 1 },
  { image: "/images/portfolio-2.jpg", name: "PORTFOLIO_2_NAME", display_order: 2 },
  { image: "/images/portfolio-3.jpg", name: "PORTFOLIO_3_NAME", display_order: 3 },
];

async function seedIfEmpty() {
  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM portfolio_items");
  if (rows[0].count > 0) return;

  for (const p of DEFAULT_ITEMS) {
    await db.query(
      "INSERT INTO portfolio_items (image, name, display_order) VALUES ($1, $2, $3)",
      [p.image, p.name, p.display_order]
    );
  }
}

export async function getPortfolioItems() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    "SELECT * FROM portfolio_items ORDER BY display_order ASC, id ASC"
  );
  return rows;
}

export async function getPortfolioItem(id) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM portfolio_items WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createPortfolioItem({ name, description, image, displayOrder }) {
  await ensureTable();
  await db.query(
    "INSERT INTO portfolio_items (name, description, image, display_order) VALUES ($1, $2, $3, $4)",
    [name || null, description || null, image, displayOrder || 0]
  );
}

export async function updatePortfolioItem(id, { name, description, image, displayOrder }) {
  await ensureTable();
  await db.query(
    `UPDATE portfolio_items
     SET name = $1, description = $2, image = $3, display_order = $4, updated_at = now()
     WHERE id = $5`,
    [name || null, description || null, image, displayOrder || 0, id]
  );
}

export async function deletePortfolioItem(id) {
  await ensureTable();
  await db.query("DELETE FROM portfolio_items WHERE id = $1", [id]);
}
