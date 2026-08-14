"use server";

import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAdminByEmail, updateAdminPassword } from "@/lib/admins";

export async function changePasswordAction(prevState, formData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Not signed in." };
  }

  const currentPassword = formData.get("currentPassword")?.toString() || "";
  const newPassword = formData.get("newPassword")?.toString() || "";
  const confirmPassword = formData.get("confirmPassword")?.toString() || "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All fields are required." };
  }
  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New password and confirmation don't match." };
  }

  const admin = await getAdminByEmail(session.user.email);
  if (!admin) {
    return { error: "Account not found." };
  }

  const isValid = await bcrypt.compare(currentPassword, admin.password_hash);
  if (!isValid) {
    return { error: "Current password is incorrect." };
  }

  await updateAdminPassword(session.user.email, newPassword);

  return { success: "Password updated." };
}
