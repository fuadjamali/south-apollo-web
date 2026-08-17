"use server";

import { revalidatePath } from "next/cache";
import { updateWaitlistStatus, deleteWaitlistEntry } from "@/lib/bookingWaitlist";

export async function setWaitlistStatusAction(formData) {
  const id = formData.get("id");
  const status = formData.get("status")?.toString() || "";
  if (!id || !status) return;

  await updateWaitlistStatus(id, status);

  revalidatePath("/admin/booking-waitlist");
}

export async function deleteWaitlistAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  await deleteWaitlistEntry(id);

  revalidatePath("/admin/booking-waitlist");
}
