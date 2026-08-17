"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createBookingService,
  updateBookingService,
  deleteBookingService,
  getBookingService,
} from "@/lib/bookingServices";
import { uploadImage, deleteImage } from "@/lib/blob";

function readForm(formData) {
  return {
    name: formData.get("name")?.toString().trim() || "",
    description: formData.get("description")?.toString().trim() || "",
    durationMinutes: parseInt(formData.get("durationMinutes"), 10) || 30,
    price: formData.get("price")?.toString().trim() || "",
    displayOrder: parseInt(formData.get("displayOrder"), 10) || 0,
    active: formData.get("active") === "on",
  };
}

export async function createBookingServiceAction(formData) {
  const data = readForm(formData);
  if (!data.name) return;

  data.image = await uploadImage(formData.get("imageFile"), "booking-services");

  await createBookingService(data);

  revalidatePath("/booking");
  revalidatePath("/admin/booking-services");
  redirect("/admin/booking-services");
}

export async function updateBookingServiceAction(id, formData) {
  const data = readForm(formData);
  if (!data.name) return;

  const existing = await getBookingService(id);
  const uploaded = await uploadImage(formData.get("imageFile"), "booking-services");
  if (uploaded) {
    await deleteImage(existing?.image);
    data.image = uploaded;
  } else {
    data.image = existing?.image || null;
  }

  await updateBookingService(id, data);

  revalidatePath("/booking");
  revalidatePath("/admin/booking-services");
  redirect("/admin/booking-services");
}

export async function deleteBookingServiceAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  const existing = await getBookingService(id);
  await deleteImage(existing?.image);
  await deleteBookingService(id);

  revalidatePath("/booking");
  revalidatePath("/admin/booking-services");
  redirect("/admin/booking-services");
}
