import { db } from "@/lib/db";

// One row per home-page section whose heading/subheading used to be hardcoded in
// config/site.js. `key` matches the module name Feature Config already uses to gate the
// section's visibility (lib/plan.js / lib/moduleSettings.js) — this table only owns the text,
// not whether the section shows at all. `hasSubheading: false` sections (Reviews,
// Certifications, Find Us) never had a subheading field in the old config either.
export const SECTION_DEFS = [
  { key: "howItWorks", label: "How It Works", hasSubheading: true },
  { key: "portfolio", label: "Portfolio (Our Work)", hasSubheading: true },
  { key: "gallery", label: "Gallery", hasSubheading: true },
  { key: "reviews", label: "Reviews", hasSubheading: false },
  { key: "certifications", label: "Certifications", hasSubheading: false },
  { key: "team", label: "Team", hasSubheading: true },
  { key: "blog", label: "Blog", hasSubheading: true },
  { key: "newsEvents", label: "News & Events", hasSubheading: true },
  { key: "enquiryForm", label: "Send an Enquiry", hasSubheading: true },
  { key: "map", label: "Find Us (map)", hasSubheading: false },
  { key: "footer", label: "Footer", hasSubheading: true },
  { key: "products", label: "Products (Add-ons)", hasSubheading: true },
  { key: "partners", label: "Trusted By (Partners)", hasSubheading: false },
];

// Seed text — this deployment's real current values (the old config/site.js defaults), not
// placeholders.
const DEFAULTS = {
  howItWorks: { heading: "How it works", subheading: "A simple process from start to finish." },
  portfolio: { heading: "Our Work", subheading: "A selection of past projects." },
  gallery: { heading: "Gallery", subheading: "A look at our recent work." },
  reviews: { heading: "What people say about us", subheading: null },
  certifications: { heading: "Certifications", subheading: null },
  team: { heading: "Meet our team", subheading: "The people behind the work." },
  blog: { heading: "From the blog", subheading: "News, updates, and stories from the team." },
  newsEvents: {
    heading: "News & Events",
    subheading: "Company announcements and upcoming events.",
  },
  enquiryForm: {
    heading: "Have a question?",
    subheading: "Tell us about your business and we'll help you pick the right plan.",
  },
  map: { heading: "Find us", subheading: null },
  footer: { heading: "Ready to work together?", subheading: "Reach out and let's get started." },
  products: {
    heading: "Add-on Services",
    subheading: "Optional extras for your new site, on top of any plan.",
  },
  partners: { heading: "Trusted by teams at", subheading: null },
};

async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS section_headings (
        section_key VARCHAR(30) PRIMARY KEY,
        heading VARCHAR(255) NOT NULL,
        subheading TEXT,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    // "CREATE TABLE IF NOT EXISTS" isn't atomic in Postgres — concurrent first-time callers
    // (e.g. every page fetching this table in parallel during `next build`) can race and both
    // attempt the create, tripping a duplicate pg_type entry. Safe to ignore: it means another
    // caller already created the table.
    if (err.code !== "23505" && err.code !== "42P07") throw err;
  }
}

// One row per SECTION_DEFS entry, seeded atomically (ON CONFLICT DO NOTHING) — see
// lib/businessInfo.js's ensureRow comment for why this pattern instead of "SELECT COUNT then
// INSERT if empty" (racy under concurrent requests, duplicated business_info for real earlier
// in this project).
async function ensureRows() {
  for (const { key } of SECTION_DEFS) {
    await db.query(
      `INSERT INTO section_headings (section_key, heading, subheading) VALUES ($1, $2, $3)
       ON CONFLICT (section_key) DO NOTHING`,
      [key, DEFAULTS[key].heading, DEFAULTS[key].subheading]
    );
  }
}

// Returns { [sectionKey]: { heading, subheading } } for every section in SECTION_DEFS.
export async function getSectionHeadings() {
  await ensureTable();
  await ensureRows();
  const { rows } = await db.query(
    "SELECT * FROM section_headings WHERE section_key = ANY($1)",
    [SECTION_DEFS.map((s) => s.key)]
  );
  const map = {};
  for (const row of rows) {
    map[row.section_key] = { heading: row.heading, subheading: row.subheading };
  }
  return map;
}

export async function updateSectionHeading(key, { heading, subheading }) {
  if (!SECTION_DEFS.some((s) => s.key === key)) {
    throw new Error(`Unknown section: ${key}`);
  }
  await ensureTable();
  await ensureRows();
  await db.query(
    "UPDATE section_headings SET heading = $1, subheading = $2, updated_at = now() WHERE section_key = $3",
    [heading, subheading || null, key]
  );
}
