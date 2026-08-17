"use server";

import { revalidatePath } from "next/cache";
import { closeMemberAccount, dismissClosureRequest } from "@/lib/members";

export async function closeMemberAccountAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  const adminNote = formData.get("adminNote")?.toString().trim() || "";
  await closeMemberAccount(id, adminNote);

  revalidatePath("/admin/account-closures");
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${id}`);
}

export async function dismissClosureRequestAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  await dismissClosureRequest(id);

  revalidatePath("/admin/account-closures");
}
