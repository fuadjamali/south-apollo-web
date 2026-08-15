"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPartner, updatePartner, deletePartner } from "@/lib/partners";

const VALID_STATUSES = ["Active", "Inactive"];

function readForm(formData) {
  const status = formData.get("status")?.toString().trim() || "";
  return {
    name: formData.get("name")?.toString().trim() || "",
    logo: formData.get("logo")?.toString().trim() || "",
    description: formData.get("description")?.toString().trim() || "",
    status: VALID_STATUSES.includes(status) ? status : "Active",
    partnershipFrom: formData.get("partnershipFrom")?.toString().trim() || "",
    partnershipEnded: formData.get("partnershipEnded")?.toString().trim() || "",
  };
}

export async function createPartnerAction(formData) {
  const data = readForm(formData);
  if (!data.name) return;

  await createPartner(data);

  revalidatePath("/");
  revalidatePath("/admin/partners");
  redirect("/admin/partners");
}

export async function updatePartnerAction(id, formData) {
  const data = readForm(formData);
  if (!data.name) return;

  await updatePartner(id, data);

  revalidatePath("/");
  revalidatePath("/admin/partners");
  redirect("/admin/partners");
}

export async function deletePartnerAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  await deletePartner(id);

  revalidatePath("/");
  revalidatePath("/admin/partners");
  redirect("/admin/partners");
}
