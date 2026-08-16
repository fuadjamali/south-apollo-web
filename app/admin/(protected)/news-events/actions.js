"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createItem, updateItem, deleteItem, getItemById } from "@/lib/newsEvents";
import { uploadImage, deleteImage } from "@/lib/blob";

const VALID_TYPES = ["News", "Event"];

function readForm(formData) {
  const type = formData.get("type")?.toString().trim() || "";
  return {
    type: VALID_TYPES.includes(type) ? type : "News",
    title: formData.get("title")?.toString().trim() || "",
    summary: formData.get("summary")?.toString().trim() || "",
    description: formData.get("description")?.toString().trim() || "",
    publishedDate: formData.get("publishedDate")?.toString().trim() || undefined,
    eventDate: formData.get("eventDate")?.toString().trim() || "",
    eventLocation: formData.get("eventLocation")?.toString().trim() || "",
  };
}

export async function createItemAction(formData) {
  const data = readForm(formData);
  if (!data.title) return;

  data.image = await uploadImage(formData.get("imageFile"), "news-events");

  const slug = await createItem(data);

  revalidatePath("/");
  revalidatePath("/news-events");
  revalidatePath(`/news-events/${slug}`);
  revalidatePath("/admin/news-events");
  redirect("/admin/news-events");
}

export async function updateItemAction(id, formData) {
  const data = readForm(formData);
  if (!data.title) return;

  const oldItem = await getItemById(id);
  const uploaded = await uploadImage(formData.get("imageFile"), "news-events");
  if (uploaded) {
    await deleteImage(oldItem?.image);
    data.image = uploaded;
  } else {
    data.image = oldItem?.image || null;
  }

  const newSlug = await updateItem(id, data);

  revalidatePath("/");
  revalidatePath("/news-events");
  revalidatePath(`/news-events/${newSlug}`);
  if (oldItem && oldItem.slug !== newSlug) {
    revalidatePath(`/news-events/${oldItem.slug}`);
  }
  revalidatePath("/admin/news-events");
  redirect("/admin/news-events");
}

export async function deleteItemAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  const existing = await getItemById(id);
  await deleteImage(existing?.image);
  const slug = await deleteItem(id);

  revalidatePath("/");
  revalidatePath("/news-events");
  if (slug) revalidatePath(`/news-events/${slug}`);
  revalidatePath("/admin/news-events");
  redirect("/admin/news-events");
}
