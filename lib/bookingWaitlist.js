import { db } from "@/lib/db";
import { ensureTable as ensureMembersTable } from "@/lib/members";
import { ensureBookingServicesTable, getBookingService } from "@/lib/bookingServices";

const VALID_STATUSES = ["Waiting", "Notified", "Fulfilled", "Cancelled"];

async function ensureTable() {
  await ensureMembersTable();
  await ensureBookingServicesTable();
  await db.query(`
    CREATE TABLE IF NOT EXISTS booking_waitlist (
      id SERIAL PRIMARY KEY,
      service_id INT REFERENCES booking_services(id) ON DELETE SET NULL,
      service_name VARCHAR(255) NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50),
      preferred_date DATE NOT NULL,
      notes TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'Waiting'
        CHECK (status IN ('Waiting', 'Notified', 'Fulfilled', 'Cancelled')),
      member_account_id INT REFERENCES members(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

// No automated matching or notification — an admin reviews this list and follows up manually
// (call/email/WhatsApp) if a slot on the requested date frees up, same "surface it, don't
// automate it" pattern as member password resets.
export async function joinWaitlist({
  serviceId,
  customerName,
  customerEmail,
  customerPhone,
  preferredDate,
  notes,
  memberAccountId,
}) {
  await ensureTable();

  const service = await getBookingService(serviceId);
  if (!service) {
    throw new Error("That service isn't available.");
  }

  await db.query(
    `INSERT INTO booking_waitlist
       (service_id, service_name, customer_name, customer_email, customer_phone, preferred_date, notes, member_account_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      serviceId,
      service.name,
      customerName,
      customerEmail,
      customerPhone || null,
      preferredDate,
      notes || null,
      memberAccountId || null,
    ]
  );
}

// Only the still-actionable entries — fulfilled/cancelled ones are history, not a queue an
// admin needs to keep working through.
export async function getWaitlist() {
  await ensureTable();
  const { rows } = await db.query(
    `SELECT * FROM booking_waitlist
     WHERE status IN ('Waiting', 'Notified')
     ORDER BY preferred_date ASC, created_at ASC`
  );
  return rows;
}

export async function updateWaitlistStatus(id, status) {
  await ensureTable();
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Invalid waitlist status.");
  }
  await db.query("UPDATE booking_waitlist SET status = $1, updated_at = now() WHERE id = $2", [
    status,
    id,
  ]);
}

export async function deleteWaitlistEntry(id) {
  await ensureTable();
  await db.query("DELETE FROM booking_waitlist WHERE id = $1", [id]);
}
