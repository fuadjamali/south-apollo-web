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

// "Sidebar Layout" pins News & Events into the aside instead of the main column (it's the one
// section on the page that's already a compact dated feed — the natural fit for a narrow
// column; a grid of product cards or the pricing table wouldn't read well squeezed into one).
// Its main column is everything else, independently reorderable from the same
// HOME_LAYOUT_SECTIONS list.
export const ASIDE_SECTION_KEY = "newsEvents";
export const DEFAULT_SIDEBAR_MAIN_ORDER = DEFAULT_SECTION_ORDER.filter(
  (key) => key !== ASIDE_SECTION_KEY
);
export const ASIDE_POSITIONS = ["left", "right"];
export const LAYOUT_NAMES = ["default", "custom", "sidebar"];

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS home_layout (
      id SERIAL PRIMARY KEY,
      layout_name VARCHAR(10) NOT NULL DEFAULT 'default',
      section_order JSONB,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  // Added after the table already shipped, for the Sidebar Layout preset.
  await db.query(
    `ALTER TABLE home_layout ADD COLUMN IF NOT EXISTS aside_position VARCHAR(5) NOT NULL DEFAULT 'right'`
  );
}

async function ensureRow() {
  await db.query(
    "INSERT INTO home_layout (id, layout_name) VALUES (1, 'default') ON CONFLICT (id) DO NOTHING"
  );
}

// Reconciles a stored order against a known-keys list: drops anything no longer known, appends
// (in relative default order) anything known but missing — so a section added to the codebase
// after a custom/sidebar order was last saved still appears somewhere, and a removed one just
// quietly disappears from the array instead of leaving a dangling reference.
function reconcile(stored, knownOrder) {
  const known = new Set(knownOrder);
  const kept = (Array.isArray(stored) ? stored : []).filter((key) => known.has(key));
  const missing = knownOrder.filter((key) => !kept.includes(key));
  return [...kept, ...missing];
}

// The layout actually in effect right now. "default" ignores whatever's stored (kept around
// only so switching away and back doesn't lose an admin's arrangement) and always returns
// DEFAULT_SECTION_ORDER with no aside, so Default tracks app/page.js's own order as new sections
// are added later. "custom" returns the full 18-section stored order (reconciled), no aside.
// "sidebar" returns the *main-column* order — the 17 sections other than News & Events,
// reconciled against DEFAULT_SIDEBAR_MAIN_ORDER — plus the stored aside_position; News & Events
// itself isn't in sectionOrder at all here, app/page.js renders it into the aside instead.
export async function getHomeLayout() {
  await ensureTable();
  await ensureRow();
  const { rows } = await db.query("SELECT * FROM home_layout WHERE id = 1");
  const row = rows[0];

  if (row.layout_name === "custom" && Array.isArray(row.section_order)) {
    return {
      layoutName: "custom",
      sectionOrder: reconcile(row.section_order, DEFAULT_SECTION_ORDER),
      asidePosition: null,
    };
  }
  if (row.layout_name === "sidebar") {
    return {
      layoutName: "sidebar",
      sectionOrder: reconcile(row.section_order, DEFAULT_SIDEBAR_MAIN_ORDER),
      asidePosition: ASIDE_POSITIONS.includes(row.aside_position) ? row.aside_position : "right",
    };
  }
  return { layoutName: "default", sectionOrder: DEFAULT_SECTION_ORDER, asidePosition: null };
}

export async function setHomeLayout({ layoutName, sectionOrder, asidePosition }) {
  await ensureTable();
  await ensureRow();
  const name = LAYOUT_NAMES.includes(layoutName) ? layoutName : "default";
  await db.query(
    `UPDATE home_layout
     SET layout_name = $1, section_order = $2, aside_position = $3, updated_at = now()
     WHERE id = 1`,
    [
      name,
      name === "default" ? null : JSON.stringify(sectionOrder),
      ASIDE_POSITIONS.includes(asidePosition) ? asidePosition : "right",
    ]
  );
}
