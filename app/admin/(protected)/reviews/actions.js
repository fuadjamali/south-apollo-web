"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createReview, updateReview, deleteReview, getReview } from "@/lib/reviews";
import { uploadImage, deleteImage } from "@/lib/blob";

function readForm(formData) {
  return {
    platformName: formData.get("platformName")?.toString().trim() || "",
    rating: formData.get("rating")?.toString().trim() || "",
    reviewCount: formData.get("reviewCount")?.toString().trim() || "",
    url: formData.get("url")?.toString().trim() || "",
    displayOrder: parseInt(formData.get("displayOrder"), 10) || 0,
  };
}

export async function createReviewAction(formData) {
  const data = readForm(formData);
  if (!data.platformName) return;

  data.logo = await uploadImage(formData.get("logoFile"), "reviews");

  await createReview(data);

  revalidatePath("/");
  revalidatePath("/admin/reviews");
  redirect("/admin/reviews");
}

export async function updateReviewAction(id, formData) {
  const data = readForm(formData);
  if (!data.platformName) return;

  const existing = await getReview(id);
  const uploaded = await uploadImage(formData.get("logoFile"), "reviews");
  if (uploaded) {
    await deleteImage(existing?.logo);
    data.logo = uploaded;
  } else {
    data.logo = existing?.logo || null;
  }

  await updateReview(id, data);

  revalidatePath("/");
  revalidatePath("/admin/reviews");
  redirect("/admin/reviews");
}

export async function deleteReviewAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  const existing = await getReview(id);
  await deleteImage(existing?.logo);
  await deleteReview(id);

  revalidatePath("/");
  revalidatePath("/admin/reviews");
  redirect("/admin/reviews");
}
