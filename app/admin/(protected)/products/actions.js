"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createProduct, updateProduct, deleteProduct, getProduct } from "@/lib/products";
import {
  getProductPhotos,
  addProductPhoto,
  setCoverPhoto,
  updatePhotoOrder,
  deleteProductPhoto,
} from "@/lib/productPhotos";
import { deleteImage } from "@/lib/blob";

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

  const product = await createProduct(data);

  revalidatePath("/");
  revalidatePath("/admin/products");
  // Straight to the edit page — that's where photos get added, since a product needs to
  // exist before photos can attach to it.
  redirect(`/admin/products/${product.id}/edit`);
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

  const photos = await getProductPhotos(id);
  for (const photo of photos) {
    await deleteImage(photo.image);
  }
  await deleteProduct(id);

  revalidatePath("/");
  revalidatePath("/admin/products");
  // Always redirect to the list — used from both the list page (harmless, already there)
  // and the edit page (avoids that page re-rendering for a product that no longer exists).
  redirect("/admin/products");
}

// Called from components/ProductPhotoManager.js after a file has already been uploaded
// directly to Blob storage client-side (see app/api/upload-product-photo/route.js) — this
// just persists the resulting URL. Returns the new photo row so the client can add it to its
// local state without a full page reload.
export async function addProductPhotoAction(productId, imageUrl, aspectRatio) {
  const photo = await addProductPhoto(productId, imageUrl, aspectRatio);
  revalidatePath("/");
  revalidatePath(`/products/${productId}`);
  revalidatePath(`/admin/products/${productId}/edit`);
  return photo;
}

export async function setCoverPhotoAction(formData) {
  const productId = formData.get("productId")?.toString();
  const photoId = formData.get("photoId")?.toString();
  if (!productId || !photoId) return;

  await setCoverPhoto(productId, photoId);
  revalidatePath("/");
  revalidatePath(`/products/${productId}`);
  revalidatePath(`/admin/products/${productId}/edit`);
}

export async function updatePhotoOrderAction(formData) {
  const productId = formData.get("productId")?.toString();
  const photoId = formData.get("photoId")?.toString();
  const displayOrder = parseInt(formData.get("displayOrder"), 10) || 0;
  if (!photoId) return;

  await updatePhotoOrder(photoId, displayOrder);
  revalidatePath(`/products/${productId}`);
  revalidatePath(`/admin/products/${productId}/edit`);
}

export async function deleteProductPhotoAction(formData) {
  const productId = formData.get("productId")?.toString();
  const photoId = formData.get("photoId")?.toString();
  const imageUrl = formData.get("imageUrl")?.toString();
  if (!photoId) return;

  await deleteProductPhoto(photoId);
  await deleteImage(imageUrl);
  revalidatePath("/");
  revalidatePath(`/products/${productId}`);
  revalidatePath(`/admin/products/${productId}/edit`);
}
