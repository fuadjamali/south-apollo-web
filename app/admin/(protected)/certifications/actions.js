"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCertification,
  updateCertification,
  deleteCertification,
  getCertification,
} from "@/lib/certifications";
import { uploadImage, deleteImage } from "@/lib/blob";

function readForm(formData) {
  return {
    name: formData.get("name")?.toString().trim() || "",
    displayOrder: parseInt(formData.get("displayOrder"), 10) || 0,
  };
}

export async function createCertificationAction(formData) {
  const data = readForm(formData);
  if (!data.name) return;

  data.image = await uploadImage(formData.get("imageFile"), "certifications");

  await createCertification(data);

  revalidatePath("/");
  revalidatePath("/admin/certifications");
  redirect("/admin/certifications");
}

export async function updateCertificationAction(id, formData) {
  const data = readForm(formData);
  if (!data.name) return;

  const existing = await getCertification(id);
  const uploaded = await uploadImage(formData.get("imageFile"), "certifications");
  if (uploaded) {
    await deleteImage(existing?.image);
    data.image = uploaded;
  } else {
    data.image = existing?.image || null;
  }

  await updateCertification(id, data);

  revalidatePath("/");
  revalidatePath("/admin/certifications");
  redirect("/admin/certifications");
}

export async function deleteCertificationAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  const existing = await getCertification(id);
  await deleteImage(existing?.image);
  await deleteCertification(id);

  revalidatePath("/");
  revalidatePath("/admin/certifications");
  redirect("/admin/certifications");
}
