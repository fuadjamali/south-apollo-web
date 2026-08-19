import { db } from "@/lib/db";

// Fixed, known set — not an open-ended CRUD list like Products/Partners, since these two are
// the standard pair every small business site needs and each has its own dedicated public
// route (see app/privacy-policy/page.js, app/terms-of-service/page.js).
export const LEGAL_PAGE_SLUGS = ["privacy-policy", "terms-of-service"];

const DEFAULTS = {
  "privacy-policy": {
    title: "Privacy Policy",
    body: "Add your privacy policy here — what data you collect, why, and how visitors can contact you about it. Until this is filled in, this page won't display to visitors.",
  },
  "terms-of-service": {
    title: "Terms of Service",
    body: "Add your terms of service here — the rules for using your site and any products or services you sell through it. Until this is filled in, this page won't display to visitors.",
  },
};

async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS legal_pages (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT,
        enabled BOOLEAN NOT NULL DEFAULT false,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    // See lib/sectionHeadings.js's ensureTable comment — concurrent first-time
    // "CREATE TABLE IF NOT EXISTS" callers can race under Postgres.
    if (err.code !== "23505" && err.code !== "42P07") throw err;
  }
}

// One row per known slug, seeded via ON CONFLICT DO NOTHING (same atomic-under-concurrency
// pattern as every other singleton-ish table — see lib/businessInfo.js's ensureRow comment).
// Starts disabled: an un-filled-in legal page is worse than no page at all (implies a real
// policy exists when it doesn't), so this is the one content type that defaults off rather
// than on until an admin has actually written something and turned it on deliberately.
async function ensureRows() {
  for (const slug of LEGAL_PAGE_SLUGS) {
    await db.query(
      `INSERT INTO legal_pages (slug, title, body, enabled) VALUES ($1, $2, $3, false)
       ON CONFLICT (slug) DO NOTHING`,
      [slug, DEFAULTS[slug].title, DEFAULTS[slug].body]
    );
  }
}

export async function getAllLegalPages() {
  await ensureTable();
  await ensureRows();
  const { rows } = await db.query(
    "SELECT * FROM legal_pages WHERE slug = ANY($1) ORDER BY slug",
    [LEGAL_PAGE_SLUGS]
  );
  return rows;
}

export async function getLegalPage(slug) {
  await ensureTable();
  await ensureRows();
  const { rows } = await db.query("SELECT * FROM legal_pages WHERE slug = $1", [slug]);
  return rows[0] || null;
}

export async function updateLegalPage(slug, { title, body, enabled }) {
  if (!LEGAL_PAGE_SLUGS.includes(slug)) {
    throw new Error(`Unknown legal page: ${slug}`);
  }
  await ensureTable();
  await ensureRows();
  await db.query(
    "UPDATE legal_pages SET title = $1, body = $2, enabled = $3, updated_at = now() WHERE slug = $4",
    [title, body || null, enabled, slug]
  );
}
