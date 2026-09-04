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

// "Sidebar Layout" pins one or more of these already-feed-shaped sections into the aside instead
// of the main column — a grid of product cards or the pricing table wouldn't read well squeezed
// into a narrow sidebar, but a dated list (News & Events, Blog) or a stream of short quotes
// (Reviews) does. An admin can pick any combination (each becomes its own stacked card in the
// aside, in this fixed order); whichever ones are chosen, the main column is every other
// section, independently reorderable from the same HOME_LAYOUT_SECTIONS list.
export const ASIDE_CONTENT_OPTIONS = [
  { key: "newsEvents", label: "News & Events" },
  { key: "blog", label: "Blog posts" },
  { key: "reviews", label: "Customer reviews" },
];
export const DEFAULT_ASIDE_CONTENT = ["newsEvents"];
export const ASIDE_POSITIONS = ["left", "right"];
// "contained" keeps the sidebar layout's whole 2-column area centered with a max width and side
// padding, same spirit as every other section's own max-w-6xl; "fill" drops both so the aside
// sits flush against the browser edge and the main column gets the full remaining width — an
// explicit admin choice (Home Page Layout → Fill) rather than always-on, since a wide aside
// column reading edge-to-edge isn't what every client wants.
export const CONTENT_WIDTHS = ["contained", "fill"];
export const DEFAULT_CONTENT_WIDTH = "contained";
export const CONTAINED_MAX_WIDTH_PX = 1980;

export const LAYOUT_NAMES = ["default", "custom", "sidebar"];

function validAsideContent(value) {
  const known = new Set(ASIDE_CONTENT_OPTIONS.map((o) => o.key));
  const filtered = (Array.isArray(value) ? value : []).filter((key) => known.has(key));
  return filtered.length > 0 ? filtered : DEFAULT_ASIDE_CONTENT;
}

// The main-column order for Sidebar Layout, given which sections are pinned to the aside — every
// other known section, in default relative order. A plain function rather than a precomputed
// constant since which keys are excluded now depends on the admin's aside-content choices.
export function sidebarMainOrderFor(asideContentKeys) {
  const excluded = new Set(asideContentKeys);
  return DEFAULT_SECTION_ORDER.filter((key) => !excluded.has(key));
}

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
  await db.query(
    `ALTER TABLE home_layout ADD COLUMN IF NOT EXISTS content_width VARCHAR(10) NOT NULL DEFAULT 'contained'`
  );
  // aside_content: which section(s) feed the Sidebar Layout aside — a JSONB array (multi-select)
  // from the start, no earlier single-value shape to migrate away from.
  await db.query(
    `ALTER TABLE home_layout ADD COLUMN IF NOT EXISTS aside_content JSONB NOT NULL DEFAULT '["newsEvents"]'::jsonb`
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
// "sidebar" returns the *main-column* order — every section other than whichever ones are
// feeding the aside, reconciled against sidebarMainOrderFor(asideContent) — plus the stored
// aside_position/aside_content/content_width. Sections feeding the aside aren't in sectionOrder
// at all here; app/page.js renders them into the aside instead of the main flow.
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
      asideContent: null,
      contentWidth: null,
    };
  }
  if (row.layout_name === "sidebar") {
    const asideContent = validAsideContent(row.aside_content);
    return {
      layoutName: "sidebar",
      sectionOrder: reconcile(row.section_order, sidebarMainOrderFor(asideContent)),
      asidePosition: ASIDE_POSITIONS.includes(row.aside_position) ? row.aside_position : "right",
      asideContent,
      contentWidth: CONTENT_WIDTHS.includes(row.content_width)
        ? row.content_width
        : DEFAULT_CONTENT_WIDTH,
    };
  }
  return {
    layoutName: "default",
    sectionOrder: DEFAULT_SECTION_ORDER,
    asidePosition: null,
    asideContent: null,
    contentWidth: null,
  };
}

export async function setHomeLayout({
  layoutName,
  sectionOrder,
  asidePosition,
  asideContent,
  contentWidth,
}) {
  await ensureTable();
  await ensureRow();
  const name = LAYOUT_NAMES.includes(layoutName) ? layoutName : "default";
  await db.query(
    `UPDATE home_layout
     SET layout_name = $1, section_order = $2, aside_position = $3, aside_content = $4,
         content_width = $5, updated_at = now()
     WHERE id = 1`,
    [
      name,
      name === "default" ? null : JSON.stringify(sectionOrder),
      ASIDE_POSITIONS.includes(asidePosition) ? asidePosition : "right",
      JSON.stringify(validAsideContent(asideContent)),
      CONTENT_WIDTHS.includes(contentWidth) ? contentWidth : DEFAULT_CONTENT_WIDTH,
    ]
  );
}
