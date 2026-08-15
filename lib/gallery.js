import { db } from "@/lib/db";

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

// "Recent" is purely chronological (upload order), no manual display_order — matches the
// literal ask ("top 3 recent photos"), unlike the display_order-driven sections elsewhere.
export async function getPhotos() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    "SELECT * FROM gallery_photos ORDER BY created_at DESC, id DESC"
  );
  return rows;
}

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

export async function createPhoto({ image, caption }) {
  await ensureTable();
  await db.query(
    "INSERT INTO gallery_photos (image, caption) VALUES ($1, $2)",
    [image, caption || null]
  );
}

export async function updatePhoto(id, { image, caption }) {
  await ensureTable();
  await db.query(
    "UPDATE gallery_photos SET image = $1, caption = $2, updated_at = now() WHERE id = $3",
    [image, caption || null, id]
  );
}

export async function deletePhoto(id) {
  await ensureTable();
  await db.query("DELETE FROM gallery_photos WHERE id = $1", [id]);
}
