"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createMilestone, updateMilestone, deleteMilestone } from "@/lib/historyMilestones";

function readForm(formData) {
  return {
    year: formData.get("year")?.toString().trim() || "",
    title: formData.get("title")?.toString().trim() || "",
    description: formData.get("description")?.toString().trim() || "",
    displayOrder: parseInt(formData.get("displayOrder"), 10) || 0,
  };
}

export async function createMilestoneAction(formData) {
  const data = readForm(formData);
  if (!data.year || !data.title) return;

  await createMilestone(data);

  revalidatePath("/");
  revalidatePath("/admin/history-milestones");
  redirect("/admin/history-milestones");
}

export async function updateMilestoneAction(id, formData) {
  const data = readForm(formData);
  if (!data.year || !data.title) return;

  await updateMilestone(id, data);

  revalidatePath("/");
  revalidatePath("/admin/history-milestones");
  redirect("/admin/history-milestones");
}

export async function deleteMilestoneAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  await deleteMilestone(id);

  revalidatePath("/");
  revalidatePath("/admin/history-milestones");
  redirect("/admin/history-milestones");
}
