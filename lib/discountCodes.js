import { db } from "@/lib/db";

async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS discount_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
        value NUMERIC(10,2) NOT NULL,
        active BOOLEAN NOT NULL DEFAULT true,
        expires_at TIMESTAMPTZ,
        usage_limit INT,
        times_used INT NOT NULL DEFAULT 0,
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

export async function getDiscountCodes() {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM discount_codes ORDER BY created_at DESC");
  return rows;
}

export async function getDiscountCode(id) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM discount_codes WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createDiscountCode({ code, type, value, active, expiresAt, usageLimit }) {
  await ensureTable();
  await db.query(
    `INSERT INTO discount_codes (code, type, value, active, expires_at, usage_limit)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [code.trim().toUpperCase(), type, value, active, expiresAt || null, usageLimit ?? null]
  );
}

export async function updateDiscountCode(id, { code, type, value, active, expiresAt, usageLimit }) {
  await ensureTable();
  await db.query(
    `UPDATE discount_codes
     SET code = $1, type = $2, value = $3, active = $4, expires_at = $5, usage_limit = $6, updated_at = now()
     WHERE id = $7`,
    [code.trim().toUpperCase(), type, value, active, expiresAt || null, usageLimit ?? null, id]
  );
}

export async function deleteDiscountCode(id) {
  await ensureTable();
  await db.query("DELETE FROM discount_codes WHERE id = $1", [id]);
}

// Validates a code against a given subtotal and returns the discount to apply, without side
// effects — call recordDiscountCodeUsage() separately once an order actually goes through.
// Never trust a discount amount submitted by the client: this is the only place the amount is
// computed, and it's always recomputed here at order time, not read back from the checkout form.
export async function validateDiscountCode(code, subtotal) {
  await ensureTable();
  const trimmed = (code || "").trim();
  if (!trimmed) return { valid: false, error: "Enter a discount code." };

  const { rows } = await db.query("SELECT * FROM discount_codes WHERE upper(code) = upper($1)", [
    trimmed,
  ]);
  const discountCode = rows[0];
  if (!discountCode) return { valid: false, error: "That discount code isn't valid." };
  if (!discountCode.active) return { valid: false, error: "That discount code is no longer active." };
  if (discountCode.expires_at && new Date(discountCode.expires_at) < new Date()) {
    return { valid: false, error: "That discount code has expired." };
  }
  if (discountCode.usage_limit !== null && discountCode.times_used >= discountCode.usage_limit) {
    return { valid: false, error: "That discount code has reached its usage limit." };
  }

  const rawAmount =
    discountCode.type === "percentage"
      ? subtotal * (Number(discountCode.value) / 100)
      : Number(discountCode.value);
  const amount = Math.min(Math.round(rawAmount * 100) / 100, subtotal);

  return { valid: true, id: discountCode.id, code: discountCode.code, amount };
}

export async function recordDiscountCodeUsage(id, client = db) {
  await client.query("UPDATE discount_codes SET times_used = times_used + 1 WHERE id = $1", [id]);
}
