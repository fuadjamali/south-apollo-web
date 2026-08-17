"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAvailabilityWindow, updateAvailabilityWindow, deleteAvailabilityWindow } from "@/lib/availability";

function readForm(formData) {
  return {
    dayOfWeek: parseInt(formData.get("dayOfWeek"), 10),
    startTime: formData.get("startTime")?.toString() || "",
    endTime: formData.get("endTime")?.toString() || "",
  };
}

export async function createAvailabilityWindowAction(formData) {
  const data = readForm(formData);
  if (Number.isNaN(data.dayOfWeek) || !data.startTime || !data.endTime) return;
  if (data.startTime >= data.endTime) return;

  await createAvailabilityWindow(data);

  revalidatePath("/booking");
  revalidatePath("/admin/availability");
  redirect("/admin/availability");
}

export async function updateAvailabilityWindowAction(id, formData) {
  const data = readForm(formData);
  if (Number.isNaN(data.dayOfWeek) || !data.startTime || !data.endTime) return;
  if (data.startTime >= data.endTime) return;

  await updateAvailabilityWindow(id, data);

  revalidatePath("/booking");
  revalidatePath("/admin/availability");
  redirect("/admin/availability");
}

export async function deleteAvailabilityWindowAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  await deleteAvailabilityWindow(id);

  revalidatePath("/booking");
  revalidatePath("/admin/availability");
  redirect("/admin/availability");
}
