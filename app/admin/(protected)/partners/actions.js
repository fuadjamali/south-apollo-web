"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPartner, updatePartner, deletePartner, getPartner } from "@/lib/partners";
import { uploadImage, deleteImage } from "@/lib/blob";

const VALID_STATUSES = ["Active", "Inactive"];

function readForm(formData) {
  const status = formData.get("status")?.toString().trim() || "";
  return {
    name: formData.get("name")?.toString().trim() || "",
    description: formData.get("description")?.toString().trim() || "",
    status: VALID_STATUSES.includes(status) ? status : "Active",
    partnershipFrom: formData.get("partnershipFrom")?.toString().trim() || "",
    partnershipEnded: formData.get("partnershipEnded")?.toString().trim() || "",
    displayOrder: parseInt(formData.get("displayOrder"), 10) || 0,
    linkUrl: formData.get("linkUrl")?.toString().trim() || "",
  };
}

export async function createPartnerAction(formData) {
  const data = readForm(formData);
  if (!data.name) return;

  data.logo = await uploadImage(formData.get("logoFile"), "partners");

  await createPartner(data);

  revalidatePath("/");
  revalidatePath("/admin/partners");
  redirect("/admin/partners");
}

export async function updatePartnerAction(id, formData) {
  const data = readForm(formData);
  if (!data.name) return;

  const existing = await getPartner(id);
  const uploaded = await uploadImage(formData.get("logoFile"), "partners");
  if (uploaded) {
    await deleteImage(existing?.logo);
    data.logo = uploaded;
  } else {
    data.logo = existing?.logo || null;
  }

  await updatePartner(id, data);

  revalidatePath("/");
  revalidatePath("/admin/partners");
  redirect("/admin/partners");
}

export async function deletePartnerAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  const existing = await getPartner(id);
  await deleteImage(existing?.logo);
  await deletePartner(id);

  revalidatePath("/");
  revalidatePath("/admin/partners");
  redirect("/admin/partners");
}
