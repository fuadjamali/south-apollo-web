"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPhoto, updatePhoto, deletePhoto, getPhoto } from "@/lib/gallery";
import { uploadImageCompressed, deleteImage } from "@/lib/blob";

function readForm(formData) {
  return {
    caption: formData.get("caption")?.toString().trim() || "",
    tags: formData
      .get("tags")
      ?.toString()
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean) || [],
    takenAt: formData.get("takenAt")?.toString() || null,
  };
}

export async function createPhotoAction(formData) {
  const data = readForm(formData);

  const image = await uploadImageCompressed(formData.get("imageFile"), "gallery");
  if (!image) return;
  data.image = image;

  await createPhoto(data);

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

export async function updatePhotoAction(id, formData) {
  const data = readForm(formData);

  const existing = await getPhoto(id);
  const uploaded = await uploadImageCompressed(formData.get("imageFile"), "gallery");
  if (uploaded) {
    await deleteImage(existing?.image);
    data.image = uploaded;
  } else {
    data.image = existing?.image;
  }
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

  const existing = await getPhoto(id);
  await deleteImage(existing?.image);
  await deletePhoto(id);

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}
