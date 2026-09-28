"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createBranch, updateBranch, deleteBranch } from "@/lib/branches";

const TEXT = ["name_en", "name_bn", "intro_en", "intro_bn", "address_en", "address_bn", "phones", "map_query"];

function readForm(formData) {
  const data = {};
  for (const field of TEXT) data[field] = formData.get(field)?.toString().trim() || "";
  data.is_main = formData.get("is_main") === "on";
  data.active = formData.get("active") === "on";
  data.display_order = parseInt(formData.get("display_order"), 10) || 0;
  return data;
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/branches");
}

export async function createBranchAction(prevState, formData) {
  const data = readForm(formData);
  if (!data.name_en) return { error: "Enter the branch name in English." };
  await createBranch(data);
  refresh();
  redirect("/admin/branches");
}

export async function updateBranchAction(id, prevState, formData) {
  const data = readForm(formData);
  if (!data.name_en) return { error: "Enter the branch name in English." };
  await updateBranch(id, data);
  refresh();
  redirect("/admin/branches");
}

export async function deleteBranchAction(formData) {
  const id = formData.get("id");
  if (!id) return;
  await deleteBranch(id);
  refresh();
  redirect("/admin/branches");
}
