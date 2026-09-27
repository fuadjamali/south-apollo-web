"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { getMemberSession } from "@/lib/memberSession";
import { getMember, updateMemberPassword, requestAccountClosure } from "@/lib/members";
import { getT } from "@/lib/i18n/server";

export async function changeMemberPasswordAction(prevState, formData) {
  const [session, { t }] = await Promise.all([getMemberSession(), getT()]);
  if (!session) {
    return { error: t("member.errorNotSignedIn") };
  }

  const currentPassword = formData.get("currentPassword")?.toString() || "";
  const newPassword = formData.get("newPassword")?.toString() || "";
  const confirmPassword = formData.get("confirmPassword")?.toString() || "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: t("member.errorAllRequired") };
  }
  if (newPassword.length < 8) {
    return { error: t("member.errorPasswordLength") };
  }
  if (newPassword !== confirmPassword) {
    return { error: t("member.errorPasswordMismatch") };
  }

  const member = await getMember(session.id);
  if (!member) {
    return { error: t("member.errorAccountNotFound") };
  }

  const isValid = await bcrypt.compare(currentPassword, member.password_hash);
  if (!isValid) {
    return { error: t("member.errorCurrentPassword") };
  }

  await updateMemberPassword(session.id, newPassword);

  return { success: t("member.passwordUpdated") };
}

export async function requestAccountClosureAction(prevState, formData) {
  const [session, { t }] = await Promise.all([getMemberSession(), getT()]);
  if (!session) {
    return { error: t("member.errorNotSignedIn") };
  }

  const reason = formData.get("reason")?.toString().trim() || "";

  await requestAccountClosure(session.id, reason);
  revalidatePath("/member/account");

  return { success: t("member.closeSent") };
}
