"use server";

import { redirect } from "next/navigation";
import {
  signUpOrClaimMember,
  verifyMemberPassword,
  createPasswordResetToken,
  resetPasswordWithToken,
} from "@/lib/members";
import { createMemberSession, clearMemberSession } from "@/lib/memberSession";
import { getT } from "@/lib/i18n/server";

// Only allow same-site relative paths — "/checkout", not "https://evil.com" or a
// protocol-relative "//evil.com" (both of which "/".startsWith would otherwise pass).
function safeRedirectTarget(target, fallback) {
  if (target && target.startsWith("/") && !target.startsWith("//")) {
    return target;
  }
  return fallback;
}

export async function signupAction(prevState, formData) {
  const { t } = await getT();
  const firstName = formData.get("firstName")?.toString().trim() || "";
  const lastName = formData.get("lastName")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim() || "";
  const password = formData.get("password")?.toString() || "";
  const confirmPassword = formData.get("confirmPassword")?.toString() || "";

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return { error: t("member.errorAllRequired") };
  }
  if (password.length < 8) {
    return { error: t("member.errorPasswordLength") };
  }
  if (password !== confirmPassword) {
    return { error: t("member.errorPasswordMismatch") };
  }

  let member;
  try {
    member = await signUpOrClaimMember({ firstName, lastName, email, password });
  } catch (err) {
    return {
      error: t(
        err.message === "An account with this email already exists."
          ? "member.errorEmailTaken"
          : "member.errorSignup"
      ),
    };
  }

  await createMemberSession({
    id: member.id,
    name: `${member.first_name} ${member.last_name}`,
    email: member.email,
  });
  redirect("/member/account");
}

export async function loginAction(prevState, formData) {
  const { t } = await getT();
  const email = formData.get("email")?.toString().trim() || "";
  const password = formData.get("password")?.toString() || "";

  if (!email || !password) {
    return { error: t("member.errorLoginRequired") };
  }

  const account = await verifyMemberPassword(email, password);
  if (!account) {
    return { error: t("member.errorInvalidLogin") };
  }

  await createMemberSession(account);
  const redirectTo = formData.get("redirectTo")?.toString() || "";
  redirect(safeRedirectTarget(redirectTo, "/member/account"));
}

export async function logoutAction() {
  await clearMemberSession();
  redirect("/member/login");
}

export async function forgotPasswordAction(prevState, formData) {
  const { t } = await getT();
  const email = formData.get("email")?.toString().trim() || "";
  if (!email) {
    return { error: t("member.errorEmailRequired") };
  }

  await createPasswordResetToken(email);

  // Same message regardless of whether the account exists, so this form can't be used to
  // find out which emails are registered.
  return { success: t("member.forgotSuccess") };
}

export async function resetPasswordAction(prevState, formData) {
  const { t } = await getT();
  const token = formData.get("token")?.toString() || "";
  const password = formData.get("password")?.toString() || "";
  const confirmPassword = formData.get("confirmPassword")?.toString() || "";

  if (!token) {
    return { error: t("member.errorResetLink") };
  }
  if (!password || !confirmPassword) {
    return { error: t("member.errorAllRequired") };
  }
  if (password.length < 8) {
    return { error: t("member.errorPasswordLength") };
  }
  if (password !== confirmPassword) {
    return { error: t("member.errorPasswordMismatch") };
  }

  const ok = await resetPasswordWithToken(token, password);
  if (!ok) {
    return { error: t("member.errorResetExpired") };
  }

  return { success: t("member.resetSuccess") };
}
