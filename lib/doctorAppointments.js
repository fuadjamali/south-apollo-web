import { db } from "@/lib/db";

// Appointment requests from the Find a Doctor page (/doctors/book). Deliberately not the
// slot-based /booking system: a doctor's serial is confirmed by the front desk over the phone,
// patients often have no email, and visiting hours live as free text on the doctor's profile.
// So a request is just "this patient wants to see this doctor around this date"; staff call
// back, give the serial, and move the status along at /admin/doctors/appointments.
export const APPOINTMENT_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"];

async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS doctor_appointments (
        id SERIAL PRIMARY KEY,
        reference VARCHAR(20) UNIQUE NOT NULL,
        doctor_id INT REFERENCES doctors(id) ON DELETE SET NULL,
        doctor_name VARCHAR(255) NOT NULL,
        patient_name VARCHAR(255) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        patient_age VARCHAR(20),
        preferred_date DATE NOT NULL,
        notes TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'Pending'
          CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
        staff_note TEXT,
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

// Short enough to read out over the phone: "DA-260927-4821" — dated in Bangladesh time, not
// the server's (UTC on Vercel).
function newReference() {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" })
    .format(new Date())
    .slice(2)
    .replace(/-/g, "");
  return `DA-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// How many requests this phone number made in the last 24 hours — the public form refuses more
// than a handful, so one person (or a bot) can't flood the front desk's list.
export async function countRecentByPhone(phone) {
  await ensureTable();
  const { rows } = await db.query(
    "SELECT COUNT(*)::int AS count FROM doctor_appointments WHERE phone = $1 AND created_at > now() - interval '24 hours'",
    [phone]
  );
  return rows[0].count;
}

export async function createAppointment({ doctorId, doctorName, patientName, phone, patientAge, preferredDate, notes }) {
  await ensureTable();
  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = newReference();
    try {
      await db.query(
        `INSERT INTO doctor_appointments
           (reference, doctor_id, doctor_name, patient_name, phone, patient_age, preferred_date, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [reference, doctorId, doctorName, patientName, phone, patientAge || null, preferredDate, notes || null]
      );
      return reference;
    } catch (err) {
      if (err.code !== "23505") throw err; // reference collision — try another
    }
  }
  throw new Error("Could not create a reference number.");
}

export async function getAppointments({ status } = {}) {
  await ensureTable();
  const { rows } = await db.query(
    `SELECT a.*, a.preferred_date::text AS preferred_date_text, d.photo AS doctor_photo, d.room AS doctor_room
     FROM doctor_appointments a
     LEFT JOIN doctors d ON d.id = a.doctor_id
     WHERE ($1::text IS NULL OR a.status = $1)
     ORDER BY (a.status = 'Pending') DESC, a.preferred_date ASC, a.created_at DESC
     LIMIT 500`,
    [status || null]
  );
  return rows;
}

export async function countPendingAppointments() {
  await ensureTable();
  const { rows } = await db.query(
    "SELECT COUNT(*)::int AS count FROM doctor_appointments WHERE status = 'Pending'"
  );
  return rows[0].count;
}

export async function updateAppointment(id, { status, staffNote }) {
  await ensureTable();
  if (!APPOINTMENT_STATUSES.includes(status)) throw new Error("Unknown status.");
  await db.query(
    "UPDATE doctor_appointments SET status = $1, staff_note = $2, updated_at = now() WHERE id = $3",
    [status, staffNote || null, id]
  );
}
