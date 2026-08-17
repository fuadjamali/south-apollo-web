"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateBookingStatus, deleteBooking } from "@/lib/bookings";

export async function updateBookingStatusAction(id, formData) {
  const status = formData.get("status")?.toString() || "";
  await updateBookingStatus(id, status);

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${id}`);
}

export async function deleteBookingAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  await deleteBooking(id);

  revalidatePath("/admin/bookings");
  redirect("/admin/bookings");
}
