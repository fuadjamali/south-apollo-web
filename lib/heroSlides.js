import { db } from "@/lib/db";
import { OVERLAY_STRENGTHS, TEXT_STYLES } from "@/lib/overlaySettings";

const HERO_SLIDES_SEED_LOCK_KEY = "falcon_web:hero_slides";
export const MEDIA_TYPES = ["image", "video"];

async function ensureTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS hero_slides (
      id SERIAL PRIMARY KEY,
      display_order INT NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT true,
      heading TEXT NOT NULL,
      subheading TEXT,
      media_type VARCHAR(10) NOT NULL DEFAULT 'image',
      background_image VARCHAR(500),
      background_image_mobile VARCHAR(500),
      background_video VARCHAR(500),
      primary_cta_label VARCHAR(100),
      primary_cta_href VARCHAR(255),
      secondary_cta_label VARCHAR(100),
      secondary_cta_href VARCHAR(255),
      overlay_strength VARCHAR(10) NOT NULL DEFAULT 'medium',
      text_style VARCHAR(10) NOT NULL DEFAULT 'auto',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

// One-time migration from the old singleton `hero_info` table (superseded by this multi-slide
// table) into slide #1 — a deployment that already had a hero keeps showing exactly that hero,
// unchanged, as a one-slide "carousel" (no chrome — see components/HeroCarousel.js) until an
// admin adds a second slide. A brand-new deployment with no hero_info table at all falls back to
// the same starting content hero_info.ensureRow() used to seed. Runs inside the same
// advisory-locked check as the row-count-zero guard in ensureSeeded, so it only ever fires once.
async function migrateOrSeed(client) {
  // A savepoint around this probe, not a bare try/catch — this runs inside ensureSeeded's own
  // transaction, and Postgres aborts an entire transaction on the first error within it (a
  // caught 42P01 here would otherwise still poison the INSERT and COMMIT below with "current
  // transaction is aborted" on any brand-new deployment that never had hero_info at all).
  let source = null;
  await client.query("SAVEPOINT hero_info_probe");
  try {
    const { rows } = await client.query("SELECT * FROM hero_info WHERE id = 1");
    source = rows[0] || null;
    await client.query("RELEASE SAVEPOINT hero_info_probe");
  } catch (err) {
    await client.query("ROLLBACK TO SAVEPOINT hero_info_probe");
    if (err.code !== "42P01") throw err; // undefined_table — hero_info was never created, fine
  }

  if (source) {
    await client.query(
      `INSERT INTO hero_slides
         (display_order, heading, subheading, media_type, background_image, background_image_mobile,
          primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href,
          overlay_strength, text_style)
       VALUES (1, $1, $2, 'image', $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        source.heading,
        source.subheading,
        source.background_image,
        source.background_image_mobile,
        source.primary_cta_label,
        source.primary_cta_href,
        source.secondary_cta_label,
        source.secondary_cta_href,
        source.overlay_strength || "medium",
        source.text_style || "auto",
      ]
    );
    return;
  }

  await client.query(
    `INSERT INTO hero_slides
       (display_order, heading, subheading, media_type, background_image,
        primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href)
     VALUES (1, $1, $2, 'image', $3, $4, $5, $6, $7)`,
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

async function ensureSeeded() {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [HERO_SLIDES_SEED_LOCK_KEY]);
    await ensureTable(client);
    const { rows } = await client.query("SELECT COUNT(*)::int AS count FROM hero_slides");
    if (rows[0].count === 0) {
      await migrateOrSeed(client);
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getHeroSlides() {
  await ensureSeeded();
  const { rows } = await db.query("SELECT * FROM hero_slides ORDER BY display_order ASC, id ASC");
  return rows;
}

// Used by the public home page — only active slides, in order.
export async function getActiveHeroSlides() {
  const slides = await getHeroSlides();
  return slides.filter((s) => s.active);
}

export async function getHeroSlide(id) {
  await ensureSeeded();
  const { rows } = await db.query("SELECT * FROM hero_slides WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createHeroSlide(data) {
  await ensureSeeded();
  const { rows: orderRows } = await db.query(
    "SELECT COALESCE(MAX(display_order), 0) + 1 AS next FROM hero_slides"
  );
  const { rows } = await db.query(
    `INSERT INTO hero_slides
       (display_order, active, heading, subheading, media_type, background_image,
        background_image_mobile, background_video, primary_cta_label, primary_cta_href,
        secondary_cta_label, secondary_cta_href, overlay_strength, text_style)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING *`,
    [
      orderRows[0].next,
      data.active !== false,
      data.heading,
      data.subheading || null,
      MEDIA_TYPES.includes(data.mediaType) ? data.mediaType : "image",
      data.backgroundImage || null,
      data.backgroundImageMobile || null,
      data.backgroundVideo || null,
      data.primaryCtaLabel || null,
      data.primaryCtaHref || null,
      data.secondaryCtaLabel || null,
      data.secondaryCtaHref || null,
      OVERLAY_STRENGTHS.includes(data.overlayStrength) ? data.overlayStrength : "medium",
      TEXT_STYLES.includes(data.textStyle) ? data.textStyle : "auto",
    ]
  );
  return rows[0];
}

export async function updateHeroSlide(id, data) {
  await ensureSeeded();
  await db.query(
    `UPDATE hero_slides
     SET heading=$1, subheading=$2, media_type=$3, background_image=$4, background_image_mobile=$5,
         background_video=$6, primary_cta_label=$7, primary_cta_href=$8, secondary_cta_label=$9,
         secondary_cta_href=$10, overlay_strength=$11, text_style=$12, active=$13, updated_at=now()
     WHERE id = $14`,
    [
      data.heading,
      data.subheading || null,
      MEDIA_TYPES.includes(data.mediaType) ? data.mediaType : "image",
      data.backgroundImage || null,
      data.backgroundImageMobile || null,
      data.backgroundVideo || null,
      data.primaryCtaLabel || null,
      data.primaryCtaHref || null,
      data.secondaryCtaLabel || null,
      data.secondaryCtaHref || null,
      OVERLAY_STRENGTHS.includes(data.overlayStrength) ? data.overlayStrength : "medium",
      TEXT_STYLES.includes(data.textStyle) ? data.textStyle : "auto",
      data.active !== false,
      id,
    ]
  );
}

export async function deleteHeroSlide(id) {
  await ensureSeeded();
  await db.query("DELETE FROM hero_slides WHERE id = $1", [id]);
}

export async function setHeroSlideOrder(orderedIds) {
  await ensureSeeded();
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    for (let i = 0; i < orderedIds.length; i++) {
      await client.query(
        "UPDATE hero_slides SET display_order = $1, updated_at = now() WHERE id = $2",
        [i + 1, orderedIds[i]]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function toggleHeroSlideActive(id, active) {
  await ensureSeeded();
  await db.query("UPDATE hero_slides SET active = $1, updated_at = now() WHERE id = $2", [active, id]);
}
