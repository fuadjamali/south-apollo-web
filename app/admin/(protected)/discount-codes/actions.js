"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
} from "@/lib/discountCodes";

function readForm(formData) {
  const expiresAtRaw = formData.get("expiresAt")?.toString().trim() || "";
  const usageLimitRaw = formData.get("usageLimit")?.toString().trim() || "";
  return {
    code: formData.get("code")?.toString().trim() || "",
    type: formData.get("type")?.toString() || "percentage",
    value: parseFloat(formData.get("value")) || 0,
    active: formData.get("active") === "on",
    expiresAt: expiresAtRaw || null,
    usageLimit: usageLimitRaw ? parseInt(usageLimitRaw, 10) : null,
  };
}

export async function createDiscountCodeAction(formData) {
  const data = readForm(formData);
  if (!data.code || data.value <= 0) return;

  await createDiscountCode(data);

  revalidatePath("/admin/discount-codes");
  redirect("/admin/discount-codes");
}

export async function updateDiscountCodeAction(id, formData) {
  const data = readForm(formData);
  if (!data.code || data.value <= 0) return;

  await updateDiscountCode(id, data);

  revalidatePath("/admin/discount-codes");
  redirect("/admin/discount-codes");
}

export async function deleteDiscountCodeAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  await deleteDiscountCode(id);

  revalidatePath("/admin/discount-codes");
  redirect("/admin/discount-codes");
}
