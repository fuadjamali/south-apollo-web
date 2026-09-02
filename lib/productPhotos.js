import { db } from "@/lib/db";
import { ASPECT_RATIOS, DEFAULT_ASPECT_RATIO } from "@/lib/photoAspectRatios";

// Extra gallery photos for a product, beyond the single `products.image` column (which stays
// as a denormalized pointer to whichever photo is the cover — kept in sync here — so the home
// page grid and every other place that just needs one thumbnail never has to join this table).
export const MAX_PHOTOS_PER_PRODUCT = 8;

// Every photo is cropped client-side before upload (see components/ImageCropModal.js) to one
// of three fixed ratios (lib/photoAspectRatios.js) — stored here so the display box (admin
// thumbnail grid and the public product gallery) can render at the ratio the photo was
// actually cropped to, instead of a fixed shape that would letterbox or distort it.

async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS product_photos (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        image VARCHAR(500) NOT NULL,
        is_cover BOOLEAN NOT NULL DEFAULT false,
        display_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    // See lib/sectionHeadings.js's ensureTable comment — concurrent first-time
    // "CREATE TABLE IF NOT EXISTS" callers can race under Postgres.
    if (err.code !== "23505" && err.code !== "42P07") throw err;
  }
  // Added after the table already shipped — ALTER ... ADD COLUMN IF NOT EXISTS instead of
  // folding into CREATE TABLE, so a deployment that already has this table picks it up
  // without a manual migration.
  await db.query(
    `ALTER TABLE product_photos ADD COLUMN IF NOT EXISTS aspect_ratio VARCHAR(10) NOT NULL DEFAULT '${DEFAULT_ASPECT_RATIO}'`
  );
}

export async function getProductPhotos(productId) {
  await ensureTable();
  const { rows } = await db.query(
    "SELECT * FROM product_photos WHERE product_id = $1 ORDER BY display_order ASC, id ASC",
    [productId]
  );
  return rows;
}

// Batch version for the public product-detail page and anywhere else that already has a set
// of product ids and wants to avoid one query per product.
export async function getProductPhotosByProductIds(productIds) {
  await ensureTable();
  if (!productIds.length) return {};
  const { rows } = await db.query(
    "SELECT * FROM product_photos WHERE product_id = ANY($1) ORDER BY display_order ASC, id ASC",
    [productIds]
  );
  const map = {};
  for (const row of rows) {
    (map[row.product_id] ??= []).push(row);
  }
  return map;
}

// New photo goes last, and becomes the cover automatically if it's the product's first photo
// (keeps `products.image` populated without the admin having to make a separate click).
// Throws if the product is already at MAX_PHOTOS_PER_PRODUCT. Runs under a per-product
// advisory lock (same technique as lib/navItems.js's ensureSeeded) so two near-simultaneous
// uploads for the same product can't both see count=0 and both claim to be "first" —
// see deleteProductPhoto's comment for the sibling bug this class of race caused for real.
export async function addProductPhoto(productId, imageUrl, aspectRatio = DEFAULT_ASPECT_RATIO) {
  await ensureTable();
  const ratio = ASPECT_RATIOS[aspectRatio] ? aspectRatio : DEFAULT_ASPECT_RATIO;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('product_photos:' || $1::text))", [
      productId,
    ]);

    const { rows: existing } = await client.query(
      "SELECT COUNT(*)::int AS count, COALESCE(MAX(display_order), 0) AS max_order FROM product_photos WHERE product_id = $1",
      [productId]
    );
    if (existing[0].count >= MAX_PHOTOS_PER_PRODUCT) {
      throw new Error(`A product can have at most ${MAX_PHOTOS_PER_PRODUCT} photos.`);
    }

    const isFirst = existing[0].count === 0;
    const { rows } = await client.query(
      "INSERT INTO product_photos (product_id, image, is_cover, display_order, aspect_ratio) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [productId, imageUrl, isFirst, existing[0].max_order + 1, ratio]
    );

    if (isFirst) {
      await client.query("UPDATE products SET image = $1, updated_at = now() WHERE id = $2", [
        imageUrl,
        productId,
      ]);
    }

    await client.query("COMMIT");
    return rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function setCoverPhoto(productId, photoId) {
  await ensureTable();
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      "SELECT image FROM product_photos WHERE id = $1 AND product_id = $2 FOR UPDATE",
      [photoId, productId]
    );
    if (!rows[0]) throw new Error("Photo not found.");

    await client.query("UPDATE product_photos SET is_cover = (id = $1) WHERE product_id = $2", [
      photoId,
      productId,
    ]);
    await client.query("UPDATE products SET image = $1, updated_at = now() WHERE id = $2", [
      rows[0].image,
      productId,
    ]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function updatePhotoOrder(photoId, displayOrder) {
  await ensureTable();
  await db.query("UPDATE product_photos SET display_order = $1 WHERE id = $2", [
    displayOrder ?? 0,
    photoId,
  ]);
}

// Deletes the photo, then unconditionally recomputes which photo is the cover from scratch
// (rather than trusting the is_cover flag as it stood before this call) and syncs
// products.image to match — self-healing against any prior drift, and safe under concurrent
// deletes (e.g. an admin clicking delete on two photos in quick succession) since the whole
// thing runs in one transaction rather than as separate read-then-write steps that could
// interleave with another call's. That interleaving is exactly what caused products.image to
// go stale for real on 2026-09-02 — see git history for this comment.
export async function deleteProductPhoto(photoId) {
  await ensureTable();
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      "SELECT product_id FROM product_photos WHERE id = $1 FOR UPDATE",
      [photoId]
    );
    const photo = rows[0];
    if (!photo) {
      await client.query("ROLLBACK");
      return;
    }

    await client.query("DELETE FROM product_photos WHERE id = $1", [photoId]);
    await client.query("UPDATE product_photos SET is_cover = false WHERE product_id = $1", [
      photo.product_id,
    ]);
    const { rows: newCover } = await client.query(
      `UPDATE product_photos SET is_cover = true
       WHERE id = (
         SELECT id FROM product_photos WHERE product_id = $1 ORDER BY display_order ASC, id ASC LIMIT 1
       )
       RETURNING image`,
      [photo.product_id]
    );
    await client.query("UPDATE products SET image = $1, updated_at = now() WHERE id = $2", [
      newCover[0]?.image ?? null,
      photo.product_id,
    ]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
