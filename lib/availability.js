import { db } from "@/lib/db";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function ensureAvailabilityTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS availability_windows (
      id SERIAL PRIMARY KEY,
      day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

export function dayName(dayOfWeek) {
  return DAY_NAMES[dayOfWeek] || "Unknown";
}

export async function getAvailabilityWindows() {
  await ensureAvailabilityTable();
  const { rows } = await db.query(
    "SELECT * FROM availability_windows ORDER BY day_of_week ASC, start_time ASC"
  );
  return rows;
}

export async function getAvailabilityWindow(id) {
  await ensureAvailabilityTable();
  const { rows } = await db.query("SELECT * FROM availability_windows WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function getWindowsForDay(dayOfWeek) {
  await ensureAvailabilityTable();
  const { rows } = await db.query(
    "SELECT * FROM availability_windows WHERE day_of_week = $1 ORDER BY start_time ASC",
    [dayOfWeek]
  );
  return rows;
}

export async function createAvailabilityWindow({ dayOfWeek, startTime, endTime }) {
  await ensureAvailabilityTable();
  await db.query(
    "INSERT INTO availability_windows (day_of_week, start_time, end_time) VALUES ($1, $2, $3)",
    [dayOfWeek, startTime, endTime]
  );
}

export async function updateAvailabilityWindow(id, { dayOfWeek, startTime, endTime }) {
  await ensureAvailabilityTable();
  await db.query(
    "UPDATE availability_windows SET day_of_week = $1, start_time = $2, end_time = $3, updated_at = now() WHERE id = $4",
    [dayOfWeek, startTime, endTime, id]
  );
}

export async function deleteAvailabilityWindow(id) {
  await ensureAvailabilityTable();
  await db.query("DELETE FROM availability_windows WHERE id = $1", [id]);
}
