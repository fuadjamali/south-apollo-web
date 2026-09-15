import { db } from "@/lib/db";
import { ASPECT_RATIOS } from "@/lib/photoAspectRatios";

const PAGE_SIZE = 24;
const VALID_ASPECT_RATIOS = Object.keys(ASPECT_RATIOS);

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS gallery_photos (
      id SERIAL PRIMARY KEY,
      image VARCHAR(500) NOT NULL,
      caption VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  // Nullable/empty-default additions — an existing photo with no tags or explicit date keeps
  // working exactly as before (tags filter just never matches it; taken_at falls back to
  // created_at for date filtering/sorting via COALESCE below).
  await db.query(
    `ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb`
  );
  await db.query(`ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS taken_at DATE`);
  // Defaults every existing photo to '1:1' — matches the masonry grid's actual current display
  // for a photo whose ratio was never tracked, so nothing visibly changes until it's re-edited
  // and a real ratio gets chosen and persisted.
  await db.query(
    `ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS aspect_ratio VARCHAR(10) NOT NULL DEFAULT '1:1'`
  );
}

// Same placeholder-content convention as every other CRUD section.
const DEFAULT_PHOTOS = [
  { image: "/images/portfolio-1.jpg", caption: "GALLERY_PHOTO_1_CAPTION" },
  { image: "/images/portfolio-2.jpg", caption: "GALLERY_PHOTO_2_CAPTION" },
  { image: "/images/portfolio-3.jpg", caption: "GALLERY_PHOTO_3_CAPTION" },
];

async function seedIfEmpty() {
  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM gallery_photos");
  if (rows[0].count > 0) return;

  for (const p of DEFAULT_PHOTOS) {
    await db.query(
      "INSERT INTO gallery_photos (image, caption) VALUES ($1, $2)",
      [p.image, p.caption]
    );
  }
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return [...new Set(tags.map((t) => t.toString().trim()).filter(Boolean))];
}

// Every distinct tag currently in use, with how many photos carry it, for the filter UI —
// most-used first (ties broken alphabetically), case-sensitive as entered (kept simple; a client
// typing "Wedding" and "wedding" gets two chips, same tradeoff lib/products.js's category field
// already makes).
export async function getAllTags() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(`
    SELECT tag, COUNT(*)::int AS count
    FROM gallery_photos, jsonb_array_elements_text(tags) AS tag
    GROUP BY tag
    ORDER BY count DESC, tag ASC
  `);
  return rows;
}

// Every distinct (year, month) with at least one photo, for the date filter — computed from
// taken_at when set, created_at otherwise, newest first.
export async function getAllPhotoMonths() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(`
    SELECT DISTINCT
      EXTRACT(YEAR FROM COALESCE(taken_at, created_at::date))::int AS year,
      EXTRACT(MONTH FROM COALESCE(taken_at, created_at::date))::int AS month
    FROM gallery_photos
    ORDER BY year DESC, month DESC
  `);
  return rows;
}

// Paginated + filterable — the public gallery's masonry grid loads a page at a time (infinite
// scroll) rather than every photo at once. `cursor` is the last-seen photo's id from the
// previous page (photos are ordered id DESC, so "id < cursor" is exactly "older than what we've
// already shown" — stable even if a new photo is added mid-scroll, unlike an OFFSET).
export async function getPhotosPage({ cursor, tag, year, month, search, limit = PAGE_SIZE } = {}) {
  await ensureTable();
  await seedIfEmpty();

  const conditions = [];
  const params = [];

  if (cursor) {
    params.push(cursor);
    conditions.push(`id < $${params.length}`);
  }
  if (tag) {
    params.push(JSON.stringify(tag));
    conditions.push(`tags @> $${params.length}::jsonb`);
  }
  if (year) {
    params.push(year);
    conditions.push(`EXTRACT(YEAR FROM COALESCE(taken_at, created_at::date)) = $${params.length}`);
  }
  if (month) {
    params.push(month);
    conditions.push(`EXTRACT(MONTH FROM COALESCE(taken_at, created_at::date)) = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    const idx = params.length;
    conditions.push(
      `(caption ILIKE $${idx} OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(tags) t WHERE t ILIKE $${idx}))`
    );
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  params.push(limit + 1); // fetch one extra to know if there's a next page, without a COUNT(*)
  const { rows } = await db.query(
    `SELECT * FROM gallery_photos ${where} ORDER BY id DESC LIMIT $${params.length}`,
    params
  );

  const hasMore = rows.length > limit;
  const photos = hasMore ? rows.slice(0, limit) : rows;
  return { photos, nextCursor: hasMore ? photos[photos.length - 1].id : null };
}

// "Recent" is purely chronological (upload order), no manual display_order — matches the
// literal ask ("top 3 recent photos"), unlike the display_order-driven sections elsewhere.
export async function getRecentPhotos(limit = 3) {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    "SELECT * FROM gallery_photos ORDER BY created_at DESC, id DESC LIMIT $1",
    [limit]
  );
  return rows;
}

export async function getPhoto(id) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM gallery_photos WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createPhoto({ image, caption, tags, takenAt, aspectRatio }) {
  await ensureTable();
  await db.query(
    "INSERT INTO gallery_photos (image, caption, tags, taken_at, aspect_ratio) VALUES ($1, $2, $3, $4, $5)",
    [
      image,
      caption || null,
      JSON.stringify(normalizeTags(tags)),
      takenAt || null,
      VALID_ASPECT_RATIOS.includes(aspectRatio) ? aspectRatio : "1:1",
    ]
  );
}

export async function updatePhoto(id, { image, caption, tags, takenAt, aspectRatio }) {
  await ensureTable();
  await db.query(
    `UPDATE gallery_photos
     SET image = $1, caption = $2, tags = $3, taken_at = $4, aspect_ratio = $5, updated_at = now()
     WHERE id = $6`,
    [
      image,
      caption || null,
      JSON.stringify(normalizeTags(tags)),
      takenAt || null,
      VALID_ASPECT_RATIOS.includes(aspectRatio) ? aspectRatio : "1:1",
      id,
    ]
  );
}

export async function deletePhoto(id) {
  await ensureTable();
  await db.query("DELETE FROM gallery_photos WHERE id = $1", [id]);
}

// Kept for the admin list page (app/admin/(protected)/gallery/page.js), which still shows every
// photo on one page rather than paging through them like the public masonry does.
export async function getPhotos() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    "SELECT * FROM gallery_photos ORDER BY created_at DESC, id DESC"
  );
  return rows;
}
