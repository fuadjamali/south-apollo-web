import { db } from "@/lib/db";
import { sanitizeBlogBody } from "@/lib/sanitizeBlogBody";

async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT,
        body TEXT,
        image VARCHAR(500),
        published_date DATE NOT NULL DEFAULT CURRENT_DATE,
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

// Same placeholder content that used to live in config/site.js.
const DEFAULT_POSTS = [
  {
    slug: "post-one",
    title: "BLOG_POST_1_TITLE",
    excerpt: "BLOG_POST_1_EXCERPT",
    body: "BLOG_POST_1_PARAGRAPH_1\n\nBLOG_POST_1_PARAGRAPH_2\n\nBLOG_POST_1_PARAGRAPH_3",
    image: "/images/blog-1.jpg",
    published_date: "2026-01-15",
  },
  {
    slug: "post-two",
    title: "BLOG_POST_2_TITLE",
    excerpt: "BLOG_POST_2_EXCERPT",
    body: "BLOG_POST_2_PARAGRAPH_1\n\nBLOG_POST_2_PARAGRAPH_2",
    image: "/images/blog-2.jpg",
    published_date: "2026-02-03",
  },
  {
    slug: "post-three",
    title: "BLOG_POST_3_TITLE",
    excerpt: "BLOG_POST_3_EXCERPT",
    body: "BLOG_POST_3_PARAGRAPH_1\n\nBLOG_POST_3_PARAGRAPH_2\n\nBLOG_POST_3_PARAGRAPH_3",
    image: "/images/blog-3.jpg",
    published_date: "2026-02-20",
  },
];

async function seedIfEmpty() {
  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM blog_posts");
  if (rows[0].count > 0) return;

  for (const p of DEFAULT_POSTS) {
    await db.query(
      "INSERT INTO blog_posts (slug, title, excerpt, body, image, published_date) VALUES ($1, $2, $3, $4, $5, $6)",
      [p.slug, p.title, p.excerpt, p.body, p.image, p.published_date]
    );
  }
}

export function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "post";
}

// Appends -2, -3, ... until a free slug is found. Small, bounded loop — fine for a
// low-volume blog; not built to survive a race between two simultaneous creates.
async function uniqueSlug(base, excludeId) {
  let slug = base;
  let suffix = 2;
  while (true) {
    const { rows } = await db.query(
      excludeId
        ? "SELECT id FROM blog_posts WHERE slug = $1 AND id != $2"
        : "SELECT id FROM blog_posts WHERE slug = $1",
      excludeId ? [slug, excludeId] : [slug]
    );
    if (rows.length === 0) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function getPosts() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    "SELECT * FROM blog_posts ORDER BY published_date DESC, id DESC"
  );
  return rows;
}

export async function getRecentPosts(limit = 3) {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    "SELECT * FROM blog_posts ORDER BY published_date DESC, id DESC LIMIT $1",
    [limit]
  );
  return rows;
}

export async function getPostBySlug(slug) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM blog_posts WHERE slug = $1", [slug]);
  return rows[0] || null;
}

export async function getPostById(id) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM blog_posts WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createPost({ title, excerpt, body, image, publishedDate }) {
  await ensureTable();
  const slug = await uniqueSlug(slugify(title));
  await db.query(
    "INSERT INTO blog_posts (slug, title, excerpt, body, image, published_date) VALUES ($1, $2, $3, $4, $5, $6)",
    [slug, title, excerpt || null, sanitizeBlogBody(body) || null, image || null, publishedDate || new Date()]
  );
  return slug;
}

export async function updatePost(id, { title, excerpt, body, image, publishedDate }) {
  await ensureTable();
  const slug = await uniqueSlug(slugify(title), id);
  await db.query(
    `UPDATE blog_posts
     SET slug = $1, title = $2, excerpt = $3, body = $4, image = $5, published_date = $6, updated_at = now()
     WHERE id = $7`,
    [
      slug,
      title,
      excerpt || null,
      sanitizeBlogBody(body) || null,
      image || null,
      publishedDate || new Date(),
      id,
    ]
  );
  return slug;
}

export async function deletePost(id) {
  await ensureTable();
  const { rows } = await db.query("DELETE FROM blog_posts WHERE id = $1 RETURNING slug", [id]);
  return rows[0]?.slug || null;
}
