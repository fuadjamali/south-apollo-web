import { db } from "@/lib/db";

export async function ensureBookingServicesTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS booking_services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        duration_minutes INT NOT NULL DEFAULT 30,
        price VARCHAR(50),
        image VARCHAR(500),
        active BOOLEAN NOT NULL DEFAULT true,
        display_order INT NOT NULL DEFAULT 0,
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

const DEFAULT_SERVICES = [
  {
    name: "BOOKING_SERVICE_1_NAME",
    description: "BOOKING_SERVICE_1_DESCRIPTION",
    duration_minutes: 30,
    display_order: 1,
  },
];

async function seedIfEmpty() {
  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM booking_services");
  if (rows[0].count > 0) return;

  for (const s of DEFAULT_SERVICES) {
    await db.query(
      "INSERT INTO booking_services (name, description, duration_minutes, display_order) VALUES ($1, $2, $3, $4)",
      [s.name, s.description, s.duration_minutes, s.display_order]
    );
  }
}

export async function getBookingServices() {
  await ensureBookingServicesTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    "SELECT * FROM booking_services ORDER BY display_order ASC, id ASC"
  );
  return rows;
}

export async function getActiveBookingServices() {
  await ensureBookingServicesTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    "SELECT * FROM booking_services WHERE active = true ORDER BY display_order ASC, id ASC"
  );
  return rows;
}

export async function getBookingService(id) {
  await ensureBookingServicesTable();
  const { rows } = await db.query("SELECT * FROM booking_services WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createBookingService({
  name,
  description,
  durationMinutes,
  price,
  image,
  active,
  displayOrder,
}) {
  await ensureBookingServicesTable();
  await db.query(
    `INSERT INTO booking_services (name, description, duration_minutes, price, image, active, display_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      name,
      description || null,
      durationMinutes || 30,
      price || null,
      image || null,
      active,
      displayOrder || 0,
    ]
  );
}

export async function updateBookingService(
  id,
  { name, description, durationMinutes, price, image, active, displayOrder }
) {
  await ensureBookingServicesTable();
  await db.query(
    `UPDATE booking_services
     SET name = $1, description = $2, duration_minutes = $3, price = $4, image = $5,
         active = $6, display_order = $7, updated_at = now()
     WHERE id = $8`,
    [
      name,
      description || null,
      durationMinutes || 30,
      price || null,
      image || null,
      active,
      displayOrder || 0,
      id,
    ]
  );
}

export async function deleteBookingService(id) {
  await ensureBookingServicesTable();
  await db.query("DELETE FROM booking_services WHERE id = $1", [id]);
}
