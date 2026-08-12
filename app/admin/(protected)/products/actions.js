"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createProduct, updateProduct, deleteProduct } from "@/lib/products";

function readForm(formData) {
  return {
    name: formData.get("name")?.toString().trim() || "",
    description: formData.get("description")?.toString().trim() || "",
    price: formData.get("price")?.toString().trim() || "",
    image: formData.get("image")?.toString().trim() || "",
    displayOrder: parseInt(formData.get("displayOrder"), 10) || 0,
  };
}

export async function createProductAction(formData) {
  const data = readForm(formData);
  if (!data.name) return;

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

  await updateProduct(id, data);

  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProductAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  await deleteProduct(id);

  revalidatePath("/");
  revalidatePath("/admin/products");
  // Always redirect to the list — used from both the list page (harmless, already there)
  // and the edit page (avoids that page re-rendering for a product that no longer exists).
  redirect("/admin/products");
}
