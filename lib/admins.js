import bcrypt from "bcrypt";
import { db } from "@/lib/db";

export async function getAdminByEmail(email) {
  const { rows } = await db.query(
    "SELECT id, email, password_hash FROM admins WHERE email = $1",
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
