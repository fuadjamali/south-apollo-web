import { db } from "@/lib/db";

async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        platform_name VARCHAR(100) NOT NULL,
        rating VARCHAR(10),
        review_count VARCHAR(50),
        url VARCHAR(500),
        logo VARCHAR(500),
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

// Same placeholder content that used to live in config/site.js.
const DEFAULT_REVIEWS = [
  {
    platform_name: "Trustpilot",
    rating: "4.8",
    review_count: "0 reviews",
    url: "https://www.trustpilot.com/review/YOUR_DOMAIN",
    logo: "/logos/trustpilot.svg",
    display_order: 1,
  },
  {
    platform_name: "Google",
    rating: "4.9",
    review_count: "0 reviews",
    url: "https://g.page/r/YOUR_GOOGLE_PLACE_ID/review",
    logo: "/logos/google.svg",
    display_order: 2,
  },
  {
    platform_name: "Clutch",
    rating: "5.0",
    review_count: "0 reviews",
    url: "https://clutch.co/profile/YOUR_PROFILE",
    logo: null,
    display_order: 3,
  },
];

async function seedIfEmpty() {
  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM reviews");
  if (rows[0].count > 0) return;

  for (const r of DEFAULT_REVIEWS) {
    await db.query(
      "INSERT INTO reviews (platform_name, rating, review_count, url, logo, display_order) VALUES ($1, $2, $3, $4, $5, $6)",
      [r.platform_name, r.rating, r.review_count, r.url, r.logo, r.display_order]
    );
  }
}

// Returned shape matches what the home page previously read from config/site.js
// (name/rating/count/url/logo), so app/page.js didn't need to change field names.
function toPublicShape(row) {
  return {
    id: row.id,
    name: row.platform_name,
    rating: row.rating,
    count: row.review_count,
    url: row.url,
    logo: row.logo,
  };
}

export async function getReviews() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    "SELECT * FROM reviews ORDER BY display_order ASC, id ASC"
  );
  return rows.map(toPublicShape);
}

export async function getReview(id) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM reviews WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createReview({ platformName, rating, reviewCount, url, logo, displayOrder }) {
  await ensureTable();
  await db.query(
    "INSERT INTO reviews (platform_name, rating, review_count, url, logo, display_order) VALUES ($1, $2, $3, $4, $5, $6)",
    [platformName, rating || null, reviewCount || null, url || null, logo || null, displayOrder || 0]
  );
}

export async function updateReview(id, { platformName, rating, reviewCount, url, logo, displayOrder }) {
  await ensureTable();
  await db.query(
    `UPDATE reviews
     SET platform_name = $1, rating = $2, review_count = $3, url = $4, logo = $5, display_order = $6, updated_at = now()
     WHERE id = $7`,
    [platformName, rating || null, reviewCount || null, url || null, logo || null, displayOrder || 0, id]
  );
}

export async function deleteReview(id) {
  await ensureTable();
  await db.query("DELETE FROM reviews WHERE id = $1", [id]);
}
