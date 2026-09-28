import { db } from "@/lib/db";
import { localizeFields, mergeTranslationSql } from "@/lib/i18n/localize";

// Health check-up packages (public page /health-checkup, admin /admin/health-packages): a list
// of packages with their prices and included tests, plus one singleton row for the page's own
// surrounding text. Prices are whole taka amounts (INT) so the page can format them and work out
// the discount; tests are stored one per line, exactly as the admin types them.
async function ensureTables() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS health_packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        previous_price INT,
        price INT NOT NULL,
        tests TEXT,
        display_order INT NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    // See lib/sectionHeadings.js's ensureTable comment — concurrent first-time
    // "CREATE TABLE IF NOT EXISTS" callers can race under Postgres.
    if (err.code !== "23505" && err.code !== "42P07") throw err;
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS health_checkup_page (
        id INT PRIMARY KEY,
        eyebrow VARCHAR(100),
        heading VARCHAR(255) NOT NULL,
        intro TEXT,
        awareness_heading VARCHAR(255),
        awareness_body TEXT,
        quote TEXT,
        why_heading VARCHAR(255),
        why_items TEXT,
        contact_heading VARCHAR(255),
        contact_intro TEXT,
        hotline VARCHAR(100),
        mobiles VARCHAR(255),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    if (err.code !== "23505" && err.code !== "42P07") throw err;
  }
  // Added after launch — a photo/illustration shown at the top of each package card.
  await db.query("ALTER TABLE health_packages ADD COLUMN IF NOT EXISTS image TEXT");
  // Bangla versions of the visitor-facing text, { bn: { … } } like the site's other admin-editable
  // rows (lib/i18n/localize.js); a blank one shows the English. Test names stay English only —
  // that's how labs and patients in Bangladesh use them.
  await db.query(
    "ALTER TABLE health_packages ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb"
  );
  await db.query(
    "ALTER TABLE health_checkup_page ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb"
  );
  // Generic defaults for a fresh install — the real client copy is loaded by
  // scripts/seed-health-packages.js or typed in at /admin/health-packages.
  await db.query(
    `INSERT INTO health_checkup_page (id, heading, intro, awareness_heading, why_heading, contact_heading)
     VALUES (1, $1, $2, $3, $4, $5)
     ON CONFLICT (id) DO NOTHING`,
    [
      "Health Check-up Packages",
      "Comprehensive screening packages for early detection and peace of mind.",
      "Health Awareness",
      "Why Choose Us?",
      "Appointment Contacts",
    ]
  );
}

// One test per line; blank lines ignored.
export function splitLines(text) {
  return (text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

// Whole-number percentage saved, or null when there's no (larger) previous price to compare to.
export function discountPercent(pkg) {
  if (!pkg.previous_price || pkg.previous_price <= pkg.price) return null;
  return Math.round(((pkg.previous_price - pkg.price) / pkg.previous_price) * 100);
}

export const PACKAGE_TRANSLATABLE_FIELDS = ["name", "description"];
export const PAGE_TRANSLATABLE_FIELDS = ["eyebrow", "heading", "intro", "awareness_heading", "awareness_body", "quote", "why_heading", "why_items", "contact_heading", "contact_intro"];

// `locale` swaps in that language's text where it's been entered (English otherwise).
export async function getActivePackages(locale) {
  await ensureTables();
  const { rows } = await db.query(
    "SELECT * FROM health_packages WHERE active ORDER BY display_order ASC, id ASC"
  );
  return rows.map((row) => localizeFields(row, locale, PACKAGE_TRANSLATABLE_FIELDS));
}

export async function getAllPackages() {
  await ensureTables();
  const { rows } = await db.query("SELECT * FROM health_packages ORDER BY display_order ASC, id ASC");
  return rows;
}

export async function getPackage(id) {
  await ensureTables();
  const { rows } = await db.query("SELECT * FROM health_packages WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createPackage({
  name,
  nameBn,
  description,
  descriptionBn,
  previousPrice,
  price,
  tests,
  image,
  displayOrder,
  active,
}) {
  await ensureTables();
  await db.query(
    `INSERT INTO health_packages (name, description, previous_price, price, tests, image, display_order, active, translations)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, jsonb_build_object('bn', $9::jsonb))`,
    [
      name, description || null, previousPrice ?? null, price, tests || null, image || null, displayOrder || 0, active,
      JSON.stringify({ name: nameBn || "", description: descriptionBn || "" }),
    ]
  );
}

export async function updatePackage(
  id,
  { name, nameBn, description, descriptionBn, previousPrice, price, tests, image, displayOrder, active }
) {
  await ensureTables();
  await db.query(
    `UPDATE health_packages
     SET name = $1, description = $2, previous_price = $3, price = $4, tests = $5, image = $6,
         display_order = $7, active = $8, ${mergeTranslationSql("$10", "$11")}, updated_at = now()
     WHERE id = $9`,
    [
      name, description || null, previousPrice ?? null, price, tests || null, image || null, displayOrder || 0, active, id,
      "bn", JSON.stringify({ name: nameBn || "", description: descriptionBn || "" }),
    ]
  );
}

export async function deletePackage(id) {
  await ensureTables();
  await db.query("DELETE FROM health_packages WHERE id = $1", [id]);
}

export async function getHealthCheckupPage(locale) {
  await ensureTables();
  const { rows } = await db.query("SELECT * FROM health_checkup_page WHERE id = 1");
  return localizeFields(rows[0], locale, PAGE_TRANSLATABLE_FIELDS);
}

export async function updateHealthCheckupPage(fields) {
  await ensureTables();
  await db.query(
    `UPDATE health_checkup_page SET
       eyebrow = $1, heading = $2, intro = $3, awareness_heading = $4, awareness_body = $5,
       quote = $6, why_heading = $7, why_items = $8, contact_heading = $9, contact_intro = $10,
       hotline = $11, mobiles = $12, ${mergeTranslationSql("$13", "$14")}, updated_at = now()
     WHERE id = 1`,
    [
      fields.eyebrow || null,
      fields.heading,
      fields.intro || null,
      fields.awarenessHeading || null,
      fields.awarenessBody || null,
      fields.quote || null,
      fields.whyHeading || null,
      fields.whyItems || null,
      fields.contactHeading || null,
      fields.contactIntro || null,
      fields.hotline || null,
      fields.mobiles || null,
      "bn",
      JSON.stringify({
      eyebrow: fields.bn?.eyebrow || "",
      heading: fields.bn?.heading || "",
      intro: fields.bn?.intro || "",
      awareness_heading: fields.bn?.awarenessHeading || "",
      awareness_body: fields.bn?.awarenessBody || "",
      quote: fields.bn?.quote || "",
      why_heading: fields.bn?.whyHeading || "",
      why_items: fields.bn?.whyItems || "",
      contact_heading: fields.bn?.contactHeading || "",
      contact_intro: fields.bn?.contactIntro || "",
      }),
    ]
  );
}
