import { db } from "@/lib/db";
import { ensureTable as ensureMembersTable } from "@/lib/members";
import { validateDiscountCode, recordDiscountCodeUsage } from "@/lib/discountCodes";

const VALID_STATUSES = ["Pending", "Confirmed", "Fulfilled", "Cancelled"];

async function ensureTables() {
  // FK dependency — members must exist before orders can reference it.
  await ensureMembersTable();
  await db.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number VARCHAR(20) UNIQUE NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50),
      customer_address TEXT,
      notes TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'Confirmed', 'Fulfilled', 'Cancelled')),
      subtotal NUMERIC(10,2) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  // Nullable — guest checkout leaves this null. Set only when the order was placed by a
  // signed-in member (see app/checkout/actions.js, which reads the session server-side
  // rather than trusting anything the client submits, so this can't be spoofed).
  await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS member_account_id INT;`);
  await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code VARCHAR(50);`);
  await db.query(
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0;`
  );
  // Member login used to live in a separate member_accounts table; that FK target is stale
  // on any database created before the tables were merged — repoint it at members(id).
  await db.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'orders_member_account_id_fkey'
          AND confrelid = 'member_accounts'::regclass
      ) THEN
        ALTER TABLE orders DROP CONSTRAINT orders_member_account_id_fkey;
      END IF;
    EXCEPTION WHEN undefined_table THEN
      -- member_accounts doesn't exist (fresh install) — nothing to repoint.
      NULL;
    END $$;
  `);
  await db.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'orders_member_account_id_fkey'
      ) THEN
        ALTER TABLE orders ADD CONSTRAINT orders_member_account_id_fkey
          FOREIGN KEY (member_account_id) REFERENCES members(id) ON DELETE SET NULL;
      END IF;
    END $$;
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INT REFERENCES products(id) ON DELETE SET NULL,
      -- Snapshot of the product at order time, so the order stays accurate even if the
      -- product is later renamed, repriced, or deleted.
      product_name VARCHAR(255) NOT NULL,
      unit_price NUMERIC(10,2) NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      line_total NUMERIC(10,2) NOT NULL
    );
  `);
}

// Pay-offline model (no payment provider configured): an order is a placed request, not a
// paid transaction. Admin follows up to arrange payment, then moves status along.
export async function createOrder({
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  notes,
  items,
  memberAccountId,
  discountCode,
}) {
  await ensureTables();

  if (!items || items.length === 0) {
    throw new Error("Cannot place an order with no items.");
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Validated before the transaction opens so an invalid/expired code fails fast with a clear
  // message rather than partway through — re-checked here rather than trusting anything the
  // checkout form submits, since the discount amount directly affects money owed.
  let discount = null;
  if (discountCode) {
    discount = await validateDiscountCode(discountCode, subtotal);
    if (!discount.valid) {
      throw new Error(discount.error);
    }
  }
  const discountAmount = discount?.amount || 0;

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const orderResult = await client.query(
      `INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, customer_address, notes, subtotal, member_account_id, discount_code, discount_amount)
       VALUES ('PENDING', $1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        customerName,
        customerEmail,
        customerPhone || null,
        customerAddress || null,
        notes || null,
        subtotal,
        memberAccountId || null,
        discount?.code || null,
        discountAmount,
      ]
    );
    const orderId = orderResult.rows[0].id;

    if (discount) {
      await recordDiscountCodeUsage(discount.id, client);
    }

    // Order number derived from the row id once it exists, rather than a separately
    // generated random token — guaranteed unique and human-readable (e.g. "ORD-000042").
    const orderNumber = `ORD-${String(orderId).padStart(6, "0")}`;
    await client.query("UPDATE orders SET order_number = $1 WHERE id = $2", [
      orderNumber,
      orderId,
    ]);

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          orderId,
          item.productId,
          item.name,
          item.unitPrice,
          item.quantity,
          item.unitPrice * item.quantity,
        ]
      );
    }

    await client.query("COMMIT");
    return { id: orderId, orderNumber };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getOrders() {
  await ensureTables();
  const { rows } = await db.query(`
    SELECT o.*, COUNT(oi.id)::int AS item_count,
           TRIM(CONCAT(m.first_name, ' ', m.last_name)) AS member_name
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN members m ON m.id = o.member_account_id
    GROUP BY o.id, m.first_name, m.last_name
    ORDER BY o.created_at DESC
  `);
  return rows;
}

async function attachItems(order) {
  if (!order) return null;
  const { rows: items } = await db.query(
    "SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC",
    [order.id]
  );
  return { ...order, items };
}

export async function getOrdersForMember(memberAccountId) {
  await ensureTables();
  const { rows } = await db.query(
    `SELECT o.*, COUNT(oi.id)::int AS item_count
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.member_account_id = $1
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [memberAccountId]
  );
  return rows;
}

export async function getOrder(id) {
  await ensureTables();
  const { rows } = await db.query(
    `SELECT o.*, TRIM(CONCAT(m.first_name, ' ', m.last_name)) AS member_name,
            m.email AS member_email
     FROM orders o
     LEFT JOIN members m ON m.id = o.member_account_id
     WHERE o.id = $1`,
    [id]
  );
  return attachItems(rows[0]);
}

export async function getOrderByNumber(orderNumber) {
  await ensureTables();
  const { rows } = await db.query("SELECT * FROM orders WHERE order_number = $1", [orderNumber]);
  return attachItems(rows[0]);
}

export async function updateOrderStatus(id, status) {
  await ensureTables();
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Invalid order status.");
  }
  await db.query("UPDATE orders SET status = $1, updated_at = now() WHERE id = $2", [status, id]);
}

export async function deleteOrder(id) {
  await ensureTables();
  await db.query("DELETE FROM orders WHERE id = $1", [id]);
}
