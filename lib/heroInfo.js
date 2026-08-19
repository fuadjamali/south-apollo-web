import { db } from "@/lib/db";

// overlay_strength controls how strong the theme-color scrim over the background image is
// (light/medium/dark); text_style lets the admin force light or dark text when the theme-based
// overlay alone isn't enough contrast for a particular image, without ever hardcoding a raw
// color that could break in one of the site's other 7 themes or dark mode — see
// app/page.js's OVERLAY_OPACITY/TEXT_STYLES maps for what each value actually renders as.
export const OVERLAY_STRENGTHS = ["light", "medium", "dark"];
export const TEXT_STYLES = ["auto", "light", "dark"];

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS hero_info (
      id SERIAL PRIMARY KEY,
      heading TEXT NOT NULL,
      subheading TEXT,
      background_image VARCHAR(500),
      primary_cta_label VARCHAR(100),
      primary_cta_href VARCHAR(255),
      secondary_cta_label VARCHAR(100),
      secondary_cta_href VARCHAR(255),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  // Added after the table already shipped — ALTER ... ADD COLUMN IF NOT EXISTS instead of
  // folding into CREATE TABLE, so a deployment that already has this table picks these up
  // without a manual migration. Defaults match the hero's original always-on behavior (medium
  // overlay, theme-matched text), so existing sites don't visibly change until an admin
  // deliberately adjusts them.
  await db.query(
    `ALTER TABLE hero_info ADD COLUMN IF NOT EXISTS overlay_strength VARCHAR(10) NOT NULL DEFAULT 'medium'`
  );
  await db.query(
    `ALTER TABLE hero_info ADD COLUMN IF NOT EXISTS text_style VARCHAR(10) NOT NULL DEFAULT 'auto'`
  );
}

// Singleton, always row id=1 — seeded via an explicit id (not the SERIAL default) with
// ON CONFLICT DO NOTHING, atomic under concurrent requests. See lib/businessInfo.js's
// ensureRow comment for why ("SELECT COUNT then INSERT if empty" is racy and duplicated
// business_info for real during ordinary concurrent page loads). Seeded from this
// deployment's real current values (config/site.js's old static `hero` block), not placeholders.
async function ensureRow() {
  await db.query(
    `INSERT INTO hero_info
       (id, heading, subheading, background_image,
        primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href)
     VALUES (1, $1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (id) DO NOTHING`,
    [
      "Today: a website. Tomorrow: a business platform.",
      "Upgrade to booking and online sales whenever you're ready — same site, same login.",
      "https://k91nyg7zo3nulbdm.public.blob.vercel-storage.com/hero/hero-background-v3-animated-dceMYnDNQEhn3L5TgwA6W4K8EP5QIr.svg",
      "View Products",
      "#products",
      "Contact Us",
      "#contact-info",
    ]
  );
}

export async function getHeroInfo() {
  await ensureTable();
  await ensureRow();
  const { rows } = await db.query("SELECT * FROM hero_info WHERE id = 1");
  return rows[0];
}

export async function updateHeroInfo({
  heading,
  subheading,
  backgroundImage,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  overlayStrength,
  textStyle,
}) {
  await ensureTable();
  await ensureRow();
  await db.query(
    `UPDATE hero_info
     SET heading = $1, subheading = $2, background_image = $3,
         primary_cta_label = $4, primary_cta_href = $5,
         secondary_cta_label = $6, secondary_cta_href = $7,
         overlay_strength = $8, text_style = $9, updated_at = now()
     WHERE id = 1`,
    [
      heading,
      subheading || null,
      backgroundImage || null,
      primaryCtaLabel || null,
      primaryCtaHref || null,
      secondaryCtaLabel || null,
      secondaryCtaHref || null,
      OVERLAY_STRENGTHS.includes(overlayStrength) ? overlayStrength : "medium",
      TEXT_STYLES.includes(textStyle) ? textStyle : "auto",
    ]
  );
}
