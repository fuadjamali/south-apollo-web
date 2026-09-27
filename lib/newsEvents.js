import { db } from "@/lib/db";

async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS news_events (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        type VARCHAR(10) NOT NULL DEFAULT 'News' CHECK (type IN ('News', 'Event')),
        title VARCHAR(255) NOT NULL,
        summary TEXT,
        description TEXT,
        image VARCHAR(500),
        published_date DATE NOT NULL DEFAULT CURRENT_DATE,
        event_date DATE,
        event_location VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    // See lib/sectionHeadings.js's ensureTable comment — concurrent first-time
    // "CREATE TABLE IF NOT EXISTS" callers can race under Postgres.
    if (err.code !== "23505" && err.code !== "42P07") throw err;
  }
}

// Same placeholder-content convention as blog/products/etc.
const DEFAULT_ITEMS = [
  {
    slug: "company-milestone",
    type: "News",
    title: "NEWS_1_TITLE",
    summary: "NEWS_1_SUMMARY",
    description: "NEWS_1_DESCRIPTION",
    image: "/images/blog-1.jpg",
    published_date: "2026-01-20",
  },
  {
    slug: "upcoming-open-day",
    type: "Event",
    title: "EVENT_1_TITLE",
    summary: "EVENT_1_SUMMARY",
    description: "EVENT_1_DESCRIPTION",
    image: "/images/blog-2.jpg",
    published_date: "2026-02-01",
    event_date: "2026-03-15",
    event_location: "EVENT_1_LOCATION",
  },
];

async function seedIfEmpty() {
  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM news_events");
  if (rows[0].count > 0) return;

  for (const item of DEFAULT_ITEMS) {
    await db.query(
      `INSERT INTO news_events
         (slug, type, title, summary, description, image, published_date, event_date, event_location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        item.slug,
        item.type,
        item.title,
        item.summary,
        item.description,
        item.image,
        item.published_date,
        item.event_date || null,
        item.event_location || null,
      ]
    );
  }
}

export function slugify(title) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "item"
  );
}

// Same bounded-loop uniqueness strategy as lib/blog.js's uniqueSlug().
async function uniqueSlug(base, excludeId) {
  let slug = base;
  let suffix = 2;
  while (true) {
    const { rows } = await db.query(
      excludeId
        ? "SELECT id FROM news_events WHERE slug = $1 AND id != $2"
        : "SELECT id FROM news_events WHERE slug = $1",
      excludeId ? [slug, excludeId] : [slug]
    );
    if (rows.length === 0) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function getItems() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    "SELECT * FROM news_events ORDER BY published_date DESC, id DESC"
  );
  return rows;
}

export async function getRecentItems(limit = 3) {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    "SELECT * FROM news_events ORDER BY published_date DESC, id DESC LIMIT $1",
    [limit]
  );
  return rows;
}

export async function getItemBySlug(slug) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM news_events WHERE slug = $1", [slug]);
  return rows[0] || null;
}

export async function getItemById(id) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM news_events WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createItem({
  type,
  title,
  summary,
  description,
  image,
  publishedDate,
  eventDate,
  eventLocation,
}) {
  await ensureTable();
  const slug = await uniqueSlug(slugify(title));
  await db.query(
    `INSERT INTO news_events
       (slug, type, title, summary, description, image, published_date, event_date, event_location)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      slug,
      type,
      title,
      summary || null,
      description || null,
      image || null,
      publishedDate || new Date(),
      eventDate || null,
      eventLocation || null,
    ]
  );
  return slug;
}

export async function updateItem(
  id,
  { type, title, summary, description, image, publishedDate, eventDate, eventLocation }
) {
  await ensureTable();
  const slug = await uniqueSlug(slugify(title), id);
  await db.query(
    `UPDATE news_events
     SET slug = $1, type = $2, title = $3, summary = $4, description = $5, image = $6,
         published_date = $7, event_date = $8, event_location = $9, updated_at = now()
     WHERE id = $10`,
    [
      slug,
      type,
      title,
      summary || null,
      description || null,
      image || null,
      publishedDate || new Date(),
      eventDate || null,
      eventLocation || null,
      id,
    ]
  );
  return slug;
}

export async function deleteItem(id) {
  await ensureTable();
  const { rows } = await db.query(
    "DELETE FROM news_events WHERE id = $1 RETURNING slug",
    [id]
  );
  return rows[0]?.slug || null;
}
