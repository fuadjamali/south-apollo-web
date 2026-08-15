"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createStat, updateStat, deleteStat } from "@/lib/stats";

function readForm(formData) {
  return {
    value: formData.get("value")?.toString().trim() || "",
    label: formData.get("label")?.toString().trim() || "",
    displayOrder: parseInt(formData.get("displayOrder"), 10) || 0,
  };
}

export async function createStatAction(formData) {
  const data = readForm(formData);
  if (!data.value || !data.label) return;

  await createStat(data);

  revalidatePath("/");
  revalidatePath("/admin/stats");
  redirect("/admin/stats");
}

export async function updateStatAction(id, formData) {
  const data = readForm(formData);
  if (!data.value || !data.label) return;

  await updateStat(id, data);

  revalidatePath("/");
  revalidatePath("/admin/stats");
  redirect("/admin/stats");
}

export async function deleteStatAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  await deleteStat(id);

  revalidatePath("/");
  revalidatePath("/admin/stats");
  redirect("/admin/stats");
}
