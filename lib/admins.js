import bcrypt from "bcrypt";
import { db } from "@/lib/db";

async function ensureTable() {
  await db.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS mobile_no VARCHAR(50);`);
}

export async function getAdminByEmail(email) {
  await ensureTable();
  const { rows } = await db.query(
    "SELECT id, email, mobile_no, password_hash FROM admins WHERE email = $1",
    [email]
  );
  return rows[0] || null;
}

export async function updateAdminPassword(email, newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.query("UPDATE admins SET password_hash = $1 WHERE email = $2", [
    passwordHash,
    email,
  ]);
}

export async function updateAdminMobile(email, mobileNo) {
  await ensureTable();
  await db.query("UPDATE admins SET mobile_no = $1 WHERE email = $2", [
    mobileNo || null,
    email,
  ]);
}
