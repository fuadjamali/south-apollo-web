import { db } from "@/lib/db";
import { ensureTable as ensureMembersTable } from "@/lib/members";
import { ensureBookingServicesTable, getBookingService } from "@/lib/bookingServices";
import { getWindowsForDay } from "@/lib/availability";

const VALID_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"];

async function ensureTables() {
  // FK dependencies must exist first.
  await ensureMembersTable();
  await ensureBookingServicesTable();
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        booking_number VARCHAR(20) UNIQUE NOT NULL,
        service_id INT REFERENCES booking_services(id) ON DELETE SET NULL,
        service_name VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        notes TEXT,
        booking_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Pending'
          CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
        member_account_id INT REFERENCES members(id) ON DELETE SET NULL,
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

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

// Local calendar date, not UTC — toISOString() shifts to UTC, which reads as "yesterday"
// for anyone west of the server's UTC offset during evening hours.
function localDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// One shared calendar for the whole business (no multi-staff/multi-resource support) — a
// booked slot blocks that time for every service, not just the one it was made for.
export async function getAvailableSlots(serviceId, dateStr) {
  await ensureTables();

  const service = await getBookingService(serviceId);
  if (!service || !service.active) return [];

  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return [];
  const dayOfWeek = date.getDay();

  const windows = await getWindowsForDay(dayOfWeek);
  if (windows.length === 0) return [];

  const { rows: existing } = await db.query(
    "SELECT start_time, end_time FROM bookings WHERE booking_date = $1 AND status != 'Cancelled'",
    [dateStr]
  );

  const now = new Date();
  const isToday = dateStr === localDateStr(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const slots = [];
  for (const window of windows) {
    let cursor = timeToMinutes(window.start_time);
    const end = timeToMinutes(window.end_time);
    while (cursor + service.duration_minutes <= end) {
      const slotStart = cursor;
      const slotEnd = cursor + service.duration_minutes;
      const overlaps = existing.some((b) => {
        const bStart = timeToMinutes(b.start_time);
        const bEnd = timeToMinutes(b.end_time);
        return slotStart < bEnd && bStart < slotEnd;
      });
      const isPast = isToday && slotStart <= nowMinutes;
      if (!overlaps && !isPast) {
        slots.push(minutesToTime(slotStart));
      }
      cursor += service.duration_minutes;
    }
  }
  return slots;
}

export async function createBooking({
  serviceId,
  customerName,
  customerEmail,
  customerPhone,
  notes,
  bookingDate,
  startTime,
  memberAccountId,
}) {
  await ensureTables();

  const service = await getBookingService(serviceId);
  if (!service || !service.active) {
    throw new Error("That service is no longer available.");
  }

  const availableSlots = await getAvailableSlots(serviceId, bookingDate);
  if (!availableSlots.includes(startTime)) {
    throw new Error("That time slot is no longer available. Please choose another.");
  }

  const startMinutes = timeToMinutes(startTime);
  const endTime = minutesToTime(startMinutes + service.duration_minutes);

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO bookings (booking_number, service_id, service_name, customer_name, customer_email,
                              customer_phone, notes, booking_date, start_time, end_time, member_account_id)
       VALUES ('PENDING', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        serviceId,
        service.name,
        customerName,
        customerEmail,
        customerPhone || null,
        notes || null,
        bookingDate,
        startTime,
        endTime,
        memberAccountId || null,
      ]
    );
    const bookingId = result.rows[0].id;

    const bookingNumber = `BKG-${String(bookingId).padStart(6, "0")}`;
    await client.query("UPDATE bookings SET booking_number = $1 WHERE id = $2", [
      bookingNumber,
      bookingId,
    ]);

    await client.query("COMMIT");
    return { id: bookingId, bookingNumber };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getBookings() {
  await ensureTables();
  const { rows } = await db.query(`
    SELECT b.*, TRIM(CONCAT(m.first_name, ' ', m.last_name)) AS member_name
    FROM bookings b
    LEFT JOIN members m ON m.id = b.member_account_id
    ORDER BY b.booking_date DESC, b.start_time DESC
  `);
  return rows;
}

export async function getBookingsForMember(memberAccountId) {
  await ensureTables();
  const { rows } = await db.query(
    "SELECT * FROM bookings WHERE member_account_id = $1 ORDER BY booking_date DESC, start_time DESC",
    [memberAccountId]
  );
  return rows;
}

export async function getBooking(id) {
  await ensureTables();
  const { rows } = await db.query(
    `SELECT b.*, TRIM(CONCAT(m.first_name, ' ', m.last_name)) AS member_name, m.email AS member_email
     FROM bookings b
     LEFT JOIN members m ON m.id = b.member_account_id
     WHERE b.id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function getBookingByNumber(bookingNumber) {
  await ensureTables();
  const { rows } = await db.query("SELECT * FROM bookings WHERE booking_number = $1", [
    bookingNumber,
  ]);
  return rows[0] || null;
}

export async function updateBookingStatus(id, status) {
  await ensureTables();
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Invalid booking status.");
  }
  await db.query("UPDATE bookings SET status = $1, updated_at = now() WHERE id = $2", [
    status,
    id,
  ]);
}

export async function deleteBooking(id) {
  await ensureTables();
  await db.query("DELETE FROM bookings WHERE id = $1", [id]);
}
