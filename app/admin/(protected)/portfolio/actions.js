"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  getPortfolioItem,
} from "@/lib/portfolio";
import { uploadImage, deleteImage } from "@/lib/blob";

function readForm(formData) {
  return {
    name: formData.get("name")?.toString().trim() || "",
    description: formData.get("description")?.toString().trim() || "",
    displayOrder: parseInt(formData.get("displayOrder"), 10) || 0,
  };
}

export async function createPortfolioItemAction(formData) {
  const data = readForm(formData);

  const image = await uploadImage(formData.get("imageFile"), "portfolio");
  if (!image) return;
  data.image = image;

  await createPortfolioItem(data);

  revalidatePath("/");
  revalidatePath("/admin/portfolio");
  redirect("/admin/portfolio");
}

export async function updatePortfolioItemAction(id, formData) {
  const data = readForm(formData);

  const existing = await getPortfolioItem(id);
  const uploaded = await uploadImage(formData.get("imageFile"), "portfolio");
  if (uploaded) {
    await deleteImage(existing?.image);
    data.image = uploaded;
  } else {
    data.image = existing?.image;
  }
  if (!data.image) return;

  await updatePortfolioItem(id, data);

  revalidatePath("/");
  revalidatePath("/admin/portfolio");
  redirect("/admin/portfolio");
}

export async function deletePortfolioItemAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  const existing = await getPortfolioItem(id);
  await deleteImage(existing?.image);
  await deletePortfolioItem(id);

  revalidatePath("/");
  revalidatePath("/admin/portfolio");
  redirect("/admin/portfolio");
}
