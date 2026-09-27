import { db } from "@/lib/db";
import { ensureTable as ensureMembersTable } from "@/lib/members";

const VALID_STATUSES = ["Pending", "Approved", "Rejected"];

async function ensureTable() {
  // FK dependency — members must exist before testimonials can reference it.
  await ensureMembersTable();
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        author_name VARCHAR(255) NOT NULL,
        author_email VARCHAR(255),
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        body TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Pending'
          CHECK (status IN ('Pending', 'Approved', 'Rejected')),
        member_account_id INT REFERENCES members(id) ON DELETE SET NULL,
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

// Public submission — always lands as "Pending", never shown on the site until an admin
// approves it. author_email is admin-only (kept in case they want to follow up), never
// returned by getApprovedTestimonials().
export async function submitTestimonial({ authorName, authorEmail, rating, body, memberAccountId }) {
  await ensureTable();
  await db.query(
    `INSERT INTO testimonials (author_name, author_email, rating, body, member_account_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [authorName, authorEmail || null, rating, body, memberAccountId || null]
  );
}

// Admin view — every testimonial, pending ones first so they can't be missed.
export async function getTestimonials() {
  await ensureTable();
  const { rows } = await db.query(`
    SELECT * FROM testimonials
    ORDER BY (status = 'Pending') DESC, created_at DESC
  `);
  return rows;
}

export async function getTestimonial(id) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM testimonials WHERE id = $1", [id]);
  return rows[0] || null;
}

// Public view — only what's safe to show a visitor, no author_email.
export async function getApprovedTestimonials(limit) {
  await ensureTable();
  const { rows } = await db.query(
    `SELECT id, author_name, rating, body, created_at
     FROM testimonials
     WHERE status = 'Approved'
     ORDER BY display_order ASC, created_at DESC
     LIMIT $1`,
    [limit || 100]
  );
  return rows;
}

export async function updateTestimonial(id, { status, displayOrder }) {
  await ensureTable();
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Invalid testimonial status.");
  }
  await db.query(
    "UPDATE testimonials SET status = $1, display_order = $2, updated_at = now() WHERE id = $3",
    [status, displayOrder ?? 0, id]
  );
}

// Average across every Approved testimonial — real, non-curated social proof to sit
// alongside the manually-entered third-party platform ratings.
export async function getTestimonialStats() {
  await ensureTable();
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count, COALESCE(AVG(rating), 0)::numeric(3,1) AS average
     FROM testimonials WHERE status = 'Approved'`
  );
  return { count: rows[0].count, average: Number(rows[0].average) };
}

export async function deleteTestimonial(id) {
  await ensureTable();
  await db.query("DELETE FROM testimonials WHERE id = $1", [id]);
}
