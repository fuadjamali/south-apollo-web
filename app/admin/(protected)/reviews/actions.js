"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createReview, updateReview, deleteReview } from "@/lib/reviews";

function readForm(formData) {
  return {
    platformName: formData.get("platformName")?.toString().trim() || "",
    rating: formData.get("rating")?.toString().trim() || "",
    reviewCount: formData.get("reviewCount")?.toString().trim() || "",
    url: formData.get("url")?.toString().trim() || "",
    logo: formData.get("logo")?.toString().trim() || "",
    displayOrder: parseInt(formData.get("displayOrder"), 10) || 0,
  };
}

export async function createReviewAction(formData) {
  const data = readForm(formData);
  if (!data.platformName) return;

  await createReview(data);

  revalidatePath("/");
  revalidatePath("/admin/reviews");
  redirect("/admin/reviews");
}

export async function updateReviewAction(id, formData) {
  const data = readForm(formData);
  if (!data.platformName) return;

  await updateReview(id, data);

  revalidatePath("/");
  revalidatePath("/admin/reviews");
  redirect("/admin/reviews");
}

export async function deleteReviewAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  await deleteReview(id);

  revalidatePath("/");
  revalidatePath("/admin/reviews");
  redirect("/admin/reviews");
}
