"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createProduct, updateProduct, deleteProduct, getProduct } from "@/lib/products";
import { uploadImage, deleteImage } from "@/lib/blob";

function readForm(formData) {
  const priceAmountRaw = formData.get("priceAmount")?.toString().trim() || "";
  return {
    name: formData.get("name")?.toString().trim() || "",
    description: formData.get("description")?.toString().trim() || "",
    price: formData.get("price")?.toString().trim() || "",
    priceAmount: priceAmountRaw ? parseFloat(priceAmountRaw) : null,
    category: formData.get("category")?.toString().trim() || "",
    displayOrder: parseInt(formData.get("displayOrder"), 10) || 0,
  };
}

export async function createProductAction(formData) {
  const data = readForm(formData);
  if (!data.name) return;

  data.image = await uploadImage(formData.get("imageFile"), "products");

  await createProduct(data);

  // Revalidate immediately rather than waiting for the home page's ISR window —
  // an admin saving a product should see it live right away.
  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProductAction(id, formData) {
  const data = readForm(formData);
  if (!data.name) return;

  const existing = await getProduct(id);
  const uploaded = await uploadImage(formData.get("imageFile"), "products");
  if (uploaded) {
    await deleteImage(existing?.image);
    data.image = uploaded;
  } else {
    data.image = existing?.image || null;
  }

  await updateProduct(id, data);

  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProductAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  const existing = await getProduct(id);
  await deleteImage(existing?.image);
  await deleteProduct(id);

  revalidatePath("/");
  revalidatePath("/admin/products");
  // Always redirect to the list — used from both the list page (harmless, already there)
  // and the edit page (avoids that page re-rendering for a product that no longer exists).
  redirect("/admin/products");
}
