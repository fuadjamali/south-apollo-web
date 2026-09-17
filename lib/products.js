import { db } from "@/lib/db";

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price VARCHAR(50),
      image VARCHAR(500),
      category VARCHAR(100),
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  // Schema migration for tables created before the category column existed.
  await db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100);`);
  // Numeric price for cart/checkout math — separate from the free-text `price` display label
  // (e.g. "$29", "From $99", "Contact for quote") so that label can stay flexible. Products
  // without a price_amount simply don't get an "Add to cart" button.
  await db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS price_amount NUMERIC(10,2);`);
}

// Same placeholder content that used to live in config/site.js, so a fresh database
// doesn't just show an empty products section.
const DEFAULT_PRODUCTS = [
  {
    name: "PRODUCT_1_NAME",
    description: "PRODUCT_1_DESCRIPTION",
    price: "PRODUCT_1_PRICE",
    image: "/images/product-1.jpg",
    category: "General",
    display_order: 1,
  },
  {
    name: "PRODUCT_2_NAME",
    description: "PRODUCT_2_DESCRIPTION",
    price: "PRODUCT_2_PRICE",
    image: "/images/product-2.jpg",
    category: "General",
    display_order: 2,
  },
  {
    name: "PRODUCT_3_NAME",
    description: "PRODUCT_3_DESCRIPTION",
    price: "PRODUCT_3_PRICE",
    image: "/images/product-3.jpg",
    category: "General",
    display_order: 3,
  },
];

async function seedIfEmpty() {
  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM products");
  if (rows[0].count > 0) return;

  for (const p of DEFAULT_PRODUCTS) {
    await db.query(
      "INSERT INTO products (name, description, price, image, category, display_order) VALUES ($1, $2, $3, $4, $5, $6)",
      [p.name, p.description, p.price, p.image, p.category, p.display_order]
    );
  }
}

export async function getProducts({ category } = {}) {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = category
    ? await db.query(
        "SELECT * FROM products WHERE category = $1 ORDER BY display_order ASC, id ASC",
        [category]
      )
    : await db.query("SELECT * FROM products ORDER BY display_order ASC, id ASC");
  return rows;
}

// Distinct, non-null categories currently in use — powers the home page filter dropdown.
export async function getProductCategories() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    "SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '' ORDER BY category ASC"
  );
  return rows.map((r) => r.category);
}

export async function getProduct(id) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM products WHERE id = $1", [id]);
  return rows[0] || null;
}

// `image` is deliberately not a param here — it's a denormalized pointer to whichever
// product_photos row is the cover, owned exclusively by lib/productPhotos.js
// (addProductPhoto/setCoverPhoto/deleteProductPhoto), which keeps it in sync. This form
// (components/ProductForm.js) has no image field at all, so it must never carry an `image`
// key into a write here — a new product simply has no cover until its first photo is added.
export async function createProduct({ name, description, price, priceAmount, category, displayOrder }) {
  await ensureTable();
  const { rows } = await db.query(
    "INSERT INTO products (name, description, price, price_amount, category, display_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [
      name,
      description || null,
      price || null,
      priceAmount ?? null,
      category || null,
      displayOrder || 0,
    ]
  );
  return rows[0];
}

// Same `image` exclusion as createProduct above — this is the fix for a real bug: this
// function used to accept and always write an `image` param, and since its only caller
// (components/ProductForm.js's basic-info save) never provides one, every save silently
// nulled out the product's cover photo pointer. The product detail page was unaffected (it
// reads product_photos directly), so the only visible symptom was the homepage grid's
// thumbnail randomly going blank after an unrelated name/price/category edit.
export async function updateProduct(id, { name, description, price, priceAmount, category, displayOrder }) {
  await ensureTable();
  await db.query(
    `UPDATE products
     SET name = $1, description = $2, price = $3, price_amount = $4, category = $5,
         display_order = $6, updated_at = now()
     WHERE id = $7`,
    [
      name,
      description || null,
      price || null,
      priceAmount ?? null,
      category || null,
      displayOrder || 0,
      id,
    ]
  );
}

export async function deleteProduct(id) {
  await ensureTable();
  await db.query("DELETE FROM products WHERE id = $1", [id]);
}
