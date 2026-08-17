"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { getMemberSession } from "@/lib/memberSession";
import { getMember, updateMemberPassword, requestAccountClosure } from "@/lib/members";

export async function changeMemberPasswordAction(prevState, formData) {
  const session = await getMemberSession();
  if (!session) {
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

  const member = await getMember(session.id);
  if (!member) {
    return { error: "Account not found." };
  }

  const isValid = await bcrypt.compare(currentPassword, member.password_hash);
  if (!isValid) {
    return { error: "Current password is incorrect." };
  }

  await updateMemberPassword(session.id, newPassword);

  return { success: "Password updated." };
}

export async function requestAccountClosureAction(prevState, formData) {
  const session = await getMemberSession();
  if (!session) {
    return { error: "Not signed in." };
  }

  const reason = formData.get("reason")?.toString().trim() || "";

  await requestAccountClosure(session.id, reason);
  revalidatePath("/member/account");

  return {
    success:
      "Your request has been sent. An admin will be in touch before anything is closed.",
  };
}
