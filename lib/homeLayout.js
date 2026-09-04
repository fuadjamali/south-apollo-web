import { db } from "@/lib/db";

// The reorderable home-page sections, in their original/default order — this array *is* the
// Default layout. Hero and Footer are deliberately excluded: they always render first/last
// regardless of layout (see app/page.js), so "layout" only ever covers what's between them.
// Keys match the section identity app/page.js's "COMPONENT:" comments already use; `label` is
// what the admin reorder UI shows.
export const HOME_LAYOUT_SECTIONS = [
  { key: "stats", label: "Stats strip" },
  { key: "trustedBy", label: "Trusted By (partners strip)" },
  { key: "howItWorks", label: "How It Works" },
  { key: "products", label: "Add-on Services (Products)" },
  { key: "plans", label: "Plans (Falcon Web Suite's own pricing — not shown on client sites)" },
  { key: "portfolio", label: "Our Work (Portfolio)" },
  { key: "gallery", label: "Gallery" },
  { key: "reviews", label: "Reviews & Customer Testimonials" },
  { key: "blog", label: "From the Blog" },
  { key: "newsEvents", label: "News & Events" },
  { key: "about", label: "About Us" },
  { key: "visionMission", label: "Vision & Mission" },
  { key: "history", label: "History" },
  { key: "team", label: "Team" },
  { key: "certifications", label: "Certifications" },
  { key: "map", label: "Find Us (map)" },
  { key: "contactInfo", label: "Contact Us" },
  { key: "enquiryForm", label: "Send an Enquiry" },
];

export const DEFAULT_SECTION_ORDER = HOME_LAYOUT_SECTIONS.map((s) => s.key);

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS home_layout (
      id SERIAL PRIMARY KEY,
      layout_name VARCHAR(10) NOT NULL DEFAULT 'default',
      section_order JSONB,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function ensureRow() {
  await db.query(
    "INSERT INTO home_layout (id, layout_name) VALUES (1, 'default') ON CONFLICT (id) DO NOTHING"
  );
}

// The section order actually in effect right now — always exactly the known keys, once each.
// "default" ignores whatever happens to be stored in section_order (kept around only so
// switching Custom -> Default -> Custom again doesn't lose the admin's arrangement) and always
// returns DEFAULT_SECTION_ORDER, so Default tracks app/page.js's own order even as new sections
// are added to HOME_LAYOUT_SECTIONS later. "custom" returns the stored order, reconciled against
// DEFAULT_SECTION_ORDER: any stored key no longer known is dropped, and any known key missing
// from the stored array (e.g. a section added to the codebase after this custom layout was last
// saved) is appended in its default relative position — so a new section always appears
// somewhere on the page rather than silently vanishing for a site running a custom layout.
export async function getHomeLayout() {
  await ensureTable();
  await ensureRow();
  const { rows } = await db.query("SELECT * FROM home_layout WHERE id = 1");
  const row = rows[0];
  if (row.layout_name !== "custom" || !Array.isArray(row.section_order)) {
    return { layoutName: "default", sectionOrder: DEFAULT_SECTION_ORDER };
  }
  const known = new Set(DEFAULT_SECTION_ORDER);
  const stored = row.section_order.filter((key) => known.has(key));
  const missing = DEFAULT_SECTION_ORDER.filter((key) => !stored.includes(key));
  return { layoutName: "custom", sectionOrder: [...stored, ...missing] };
}

export async function setHomeLayout({ layoutName, sectionOrder }) {
  await ensureTable();
  await ensureRow();
  const name = layoutName === "custom" ? "custom" : "default";
  await db.query(
    `UPDATE home_layout SET layout_name = $1, section_order = $2, updated_at = now() WHERE id = 1`,
    [name, name === "custom" ? JSON.stringify(sectionOrder) : null]
  );
}
