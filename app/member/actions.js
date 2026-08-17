"use server";

import { redirect } from "next/navigation";
import {
  signUpOrClaimMember,
  verifyMemberPassword,
  createPasswordResetToken,
  resetPasswordWithToken,
} from "@/lib/members";
import { createMemberSession, clearMemberSession } from "@/lib/memberSession";

// Only allow same-site relative paths — "/checkout", not "https://evil.com" or a
// protocol-relative "//evil.com" (both of which "/".startsWith would otherwise pass).
function safeRedirectTarget(target, fallback) {
  if (target && target.startsWith("/") && !target.startsWith("//")) {
    return target;
  }
  return fallback;
}

export async function signupAction(prevState, formData) {
  const firstName = formData.get("firstName")?.toString().trim() || "";
  const lastName = formData.get("lastName")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim() || "";
  const password = formData.get("password")?.toString() || "";
  const confirmPassword = formData.get("confirmPassword")?.toString() || "";

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return { error: "All fields are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Password and confirmation don't match." };
  }

  let member;
  try {
    member = await signUpOrClaimMember({ firstName, lastName, email, password });
  } catch (err) {
    return { error: err.message || "Couldn't create account." };
  }

  await createMemberSession({
    id: member.id,
    name: `${member.first_name} ${member.last_name}`,
    email: member.email,
  });
  redirect("/member/account");
}

export async function loginAction(prevState, formData) {
  const email = formData.get("email")?.toString().trim() || "";
  const password = formData.get("password")?.toString() || "";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const account = await verifyMemberPassword(email, password);
  if (!account) {
    return { error: "Invalid email or password." };
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
  const email = formData.get("email")?.toString().trim() || "";
  if (!email) {
    return { error: "Enter your email address." };
  }

  await createPasswordResetToken(email);

  // Same message regardless of whether the account exists, so this form can't be used to
  // find out which emails are registered.
  return {
    success:
      "If an account exists for that email, we've noted the request — an admin will be in touch with a reset link shortly.",
  };
}

export async function resetPasswordAction(prevState, formData) {
  const token = formData.get("token")?.toString() || "";
  const password = formData.get("password")?.toString() || "";
  const confirmPassword = formData.get("confirmPassword")?.toString() || "";

  if (!token) {
    return { error: "Missing or invalid reset link." };
  }
  if (!password || !confirmPassword) {
    return { error: "All fields are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Password and confirmation don't match." };
  }

  const ok = await resetPasswordWithToken(token, password);
  if (!ok) {
    return { error: "This reset link is invalid or has expired. Ask an admin for a new one." };
  }

  return { success: "Password reset. You can now log in with your new password." };
}
