"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPhoto, updatePhoto, deletePhoto } from "@/lib/gallery";

function readForm(formData) {
  return {
    image: formData.get("image")?.toString().trim() || "",
    caption: formData.get("caption")?.toString().trim() || "",
  };
}

export async function createPhotoAction(formData) {
  const data = readForm(formData);
  if (!data.image) return;

  await createPhoto(data);

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

export async function updatePhotoAction(id, formData) {
  const data = readForm(formData);
  if (!data.image) return;

  await updatePhoto(id, data);

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

export async function deletePhotoAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  await deletePhoto(id);

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}
