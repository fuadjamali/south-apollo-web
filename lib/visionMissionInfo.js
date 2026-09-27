import { db } from "@/lib/db";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { localizeFields, mergeTranslationSql } from "@/lib/i18n/localize";
import { OVERLAY_STRENGTHS, TEXT_STYLES } from "@/lib/overlaySettings";

export const IMAGE_POSITIONS = ["left", "right", "behind"];

async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS vision_mission_info (
        id SERIAL PRIMARY KEY,
        heading VARCHAR(255) NOT NULL DEFAULT 'Vision & Mission',
        body TEXT,
        image VARCHAR(500),
        image_position VARCHAR(6) NOT NULL DEFAULT 'left',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    // See lib/sectionHeadings.js's ensureTable comment — concurrent first-time
    // "CREATE TABLE IF NOT EXISTS" callers can race under Postgres.
    if (err.code !== "23505" && err.code !== "42P07") throw err;
  }
  // Added after the table already shipped — same as lib/aboutInfo.js's ensureTable. The column
  // widens from VARCHAR(5) ("left"/"right" only) to fit "behind"; ALTER COLUMN TYPE is a no-op
  // on Postgres when the new length already fits every existing value, so this is safe to run
  // on a table that already has rows. Defaults (medium/auto) match hero/about's own defaults so
  // "behind" looks the same everywhere an admin picks it.
  await db.query(`ALTER TABLE vision_mission_info ALTER COLUMN image_position TYPE VARCHAR(6)`);
  await db.query(
    `ALTER TABLE vision_mission_info ADD COLUMN IF NOT EXISTS overlay_strength VARCHAR(10) NOT NULL DEFAULT 'medium'`
  );
  await db.query(
    `ALTER TABLE vision_mission_info ADD COLUMN IF NOT EXISTS text_style VARCHAR(10) NOT NULL DEFAULT 'auto'`
  );
  // Section title in other languages, { bn: { heading } } — lib/i18n/localize.js.
  await db.query(
    `ALTER TABLE vision_mission_info ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb`
  );
}

// Singleton, always row id=1 — same pattern as lib/aboutInfo.js. Seeded with an empty body
// deliberately (not placeholder copy): this module defaults to off (see lib/moduleSettings.js's
// ensureTable seed) precisely because most clients don't need it, and app/page.js only renders
// the section once an admin has actually written a body, so an empty seed never shows a blank
// section to a client who switched the module on without filling it in yet.
async function ensureRow() {
  await db.query(
    "INSERT INTO vision_mission_info (id, heading) VALUES (1, $1) ON CONFLICT (id) DO NOTHING",
    ["Vision & Mission"]
  );
}

// `locale` swaps in that language's heading where one is set (English otherwise).
export async function getVisionMissionInfo(locale = DEFAULT_LOCALE) {
  await ensureTable();
  await ensureRow();
  const { rows } = await db.query("SELECT * FROM vision_mission_info WHERE id = 1");
  return localizeFields(rows[0], locale, ["heading"]);
}

export async function updateVisionMissionInfo({
  heading,
  headingBn,
  body,
  image,
  imagePosition,
  overlayStrength,
  textStyle,
}) {
  await ensureTable();
  await ensureRow();
  await db.query(
    `UPDATE vision_mission_info
     SET heading = $1, body = $2, image = $3, image_position = $4,
         overlay_strength = $5, text_style = $6, ${mergeTranslationSql("$7", "$8")},
         updated_at = now()
     WHERE id = 1`,
    [
      heading,
      body || null,
      image || null,
      IMAGE_POSITIONS.includes(imagePosition) ? imagePosition : "left",
      OVERLAY_STRENGTHS.includes(overlayStrength) ? overlayStrength : "medium",
      TEXT_STYLES.includes(textStyle) ? textStyle : "auto",
      "bn",
      JSON.stringify({ heading: headingBn || "" }),
    ]
  );
}
