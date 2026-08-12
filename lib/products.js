import { db } from "@/lib/db";

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price VARCHAR(50),
      image VARCHAR(500),
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

// Same placeholder content that used to live in config/site.js, so a fresh database
// doesn't just show an empty products section.
const DEFAULT_PRODUCTS = [
  {
    name: "PRODUCT_1_NAME",
    description: "PRODUCT_1_DESCRIPTION",
    price: "PRODUCT_1_PRICE",
    image: "/images/product-1.jpg",
    display_order: 1,
  },
  {
    name: "PRODUCT_2_NAME",
    description: "PRODUCT_2_DESCRIPTION",
    price: "PRODUCT_2_PRICE",
    image: "/images/product-2.jpg",
    display_order: 2,
  },
  {
    name: "PRODUCT_3_NAME",
    description: "PRODUCT_3_DESCRIPTION",
    price: "PRODUCT_3_PRICE",
    image: "/images/product-3.jpg",
    display_order: 3,
  },
];

async function seedIfEmpty() {
  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM products");
  if (rows[0].count > 0) return;

  for (const p of DEFAULT_PRODUCTS) {
    await db.query(
      "INSERT INTO products (name, description, price, image, display_order) VALUES ($1, $2, $3, $4, $5)",
      [p.name, p.description, p.price, p.image, p.display_order]
    );
  }
}

export async function getProducts() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    "SELECT * FROM products ORDER BY display_order ASC, id ASC"
  );
  return rows;
}

export async function getProduct(id) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM products WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createProduct({ name, description, price, image, displayOrder }) {
  await ensureTable();
  await db.query(
    "INSERT INTO products (name, description, price, image, display_order) VALUES ($1, $2, $3, $4, $5)",
    [name, description || null, price || null, image || null, displayOrder || 0]
  );
}

export async function updateProduct(id, { name, description, price, image, displayOrder }) {
  await ensureTable();
  await db.query(
    `UPDATE products
     SET name = $1, description = $2, price = $3, image = $4, display_order = $5, updated_at = now()
     WHERE id = $6`,
    [name, description || null, price || null, image || null, displayOrder || 0, id]
  );
}

export async function deleteProduct(id) {
  await ensureTable();
  await db.query("DELETE FROM products WHERE id = $1", [id]);
}
