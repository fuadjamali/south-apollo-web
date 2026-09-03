import { db } from "@/lib/db";

// Friendly metadata for every module `lib/plan.js` can gate, grouped for the admin Feature
// Config screen. Deliberately separate from lib/planFeatures.js (that one is a marketing-style
// comparison table; this one is keyed 1:1 to the internal module names lib/plan.js uses).
export const MODULE_GROUPS = [
  {
    label: "Core",
    modules: [
      { key: "hero", label: "Hero (top banner)" },
      { key: "stats", label: "Stats strip" },
      { key: "howItWorks", label: "How It Works" },
      { key: "products", label: "Add-on Services (Products)" },
      { key: "portfolio", label: "Our Work (Portfolio)" },
      { key: "about", label: "About Us" },
      { key: "visionMission", label: "Vision & Mission" },
      { key: "history", label: "Our History" },
      { key: "enquiryForm", label: "Send an Enquiry" },
      { key: "map", label: "Find Us (map)" },
      { key: "footer", label: "Footer (WhatsApp CTA + social + copyright)" },
    ],
  },
  {
    label: "Content & Marketing",
    modules: [
      { key: "blog", label: "Blog" },
      { key: "newsEvents", label: "News & Events" },
      { key: "gallery", label: "Gallery" },
      { key: "reviews", label: "Reviews (third-party + customer-submitted)" },
      { key: "partners", label: "Partners strip" },
      { key: "team", label: "Team & Team Members" },
      { key: "certifications", label: "Certifications" },
    ],
  },
  {
    label: "Booking",
    modules: [{ key: "booking", label: "Online booking + waitlist" }],
  },
  {
    label: "Commerce",
    modules: [
      { key: "cart", label: "Shopping cart + checkout + orders" },
      { key: "members", label: "Member login portal" },
    ],
  },
  {
    label: "Appearance",
    modules: [{ key: "themes", label: "Full theme switcher (8 palettes + dark mode)" }],
  },
  {
    label: "Tools",
    modules: [{ key: "ai", label: "“Write with AI” content assistant" }],
  },
];

async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS module_settings (
        module_name VARCHAR(64) PRIMARY KEY,
        enabled BOOLEAN NOT NULL DEFAULT true,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    // getModuleStates() is called from the admin root layout, so on a brand-new deployment
    // every statically-generated admin page races to run this CREATE TABLE at once — Postgres's
    // IF NOT EXISTS isn't safe under that level of concurrency, and the losing transaction gets
    // a duplicate-key error on pg_catalog even though the table now legitimately exists (created
    // by whichever transaction won). Only that specific race is safe to swallow.
    if (err.code !== "23505") throw err;
  }
  // Every other module defaults to enabled via getModuleOverrides()'s "no row = on" fallback —
  // right for baseline sections a site should show out of the box. These two are opt-in instead
  // (most clients don't want them, per the brief that shipped them): rather than flip the
  // fallback's polarity for just two keys, seed an explicit `enabled = false` row for each, once,
  // so a client who wants either switches it on deliberately from Feature Config. ON CONFLICT DO
  // NOTHING makes this idempotent — cheap on repeat calls, and never overwrites an admin's own
  // choice once they've toggled either one.
  await db.query(
    `INSERT INTO module_settings (module_name, enabled) VALUES ('visionMission', false), ('history', false)
     ON CONFLICT (module_name) DO NOTHING`
  );
}

// Missing rows default to enabled — a module with no row yet (new deployment, or a module an
// admin has never touched) behaves exactly as before this feature existed: gated only by tier.
export async function getModuleOverrides() {
  await ensureTable();
  const { rows } = await db.query("SELECT module_name, enabled FROM module_settings");
  const overrides = {};
  for (const row of rows) {
    overrides[row.module_name] = row.enabled;
  }
  return overrides;
}

export async function setModuleEnabled(moduleName, enabled) {
  await ensureTable();
  await db.query(
    `INSERT INTO module_settings (module_name, enabled, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (module_name) DO UPDATE SET enabled = $2, updated_at = now()`,
    [moduleName, enabled]
  );
}
