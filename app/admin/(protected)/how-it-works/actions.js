"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createStep, updateStep, deleteStep } from "@/lib/howItWorks";

function readForm(formData) {
  return {
    title: formData.get("title")?.toString().trim() || "",
    description: formData.get("description")?.toString().trim() || "",
    displayOrder: parseInt(formData.get("displayOrder"), 10) || 0,
    icon: formData.get("icon")?.toString() || null,
  };
}

export async function createStepAction(formData) {
  const data = readForm(formData);
  if (!data.title) return;

  await createStep(data);

  revalidatePath("/");
  revalidatePath("/admin/how-it-works");
  redirect("/admin/how-it-works");
}

export async function updateStepAction(id, formData) {
  const data = readForm(formData);
  if (!data.title) return;

  await updateStep(id, data);

  revalidatePath("/");
  revalidatePath("/admin/how-it-works");
  redirect("/admin/how-it-works");
}

export async function deleteStepAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  await deleteStep(id);

  revalidatePath("/");
  revalidatePath("/admin/how-it-works");
  redirect("/admin/how-it-works");
}
