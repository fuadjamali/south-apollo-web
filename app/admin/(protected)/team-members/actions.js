"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createTeamMember, updateTeamMember, deleteTeamMember, getTeamMember } from "@/lib/teamMembers";
import { uploadImage, deleteImage } from "@/lib/blob";

function readForm(formData) {
  return {
    idNo: formData.get("idNo")?.toString().trim() || "",
    name: formData.get("name")?.toString().trim() || "",
    title: formData.get("title")?.toString().trim() || "",
    contactNo: formData.get("contactNo")?.toString().trim() || "",
    email: formData.get("email")?.toString().trim() || "",
    serviceJoinDate: formData.get("serviceJoinDate")?.toString().trim() || "",
    serviceEndDate: formData.get("serviceEndDate")?.toString().trim() || "",
    teamId: formData.get("teamId") ? parseInt(formData.get("teamId"), 10) : null,
    active: formData.get("active") === "on",
    showOnHome: formData.get("showOnHome") === "on",
  };
}

export async function createTeamMemberAction(formData) {
  const data = readForm(formData);
  if (!data.name || !data.teamId) return;

  data.photo = await uploadImage(formData.get("photoFile"), "team");

  await createTeamMember(data);

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/admin/team-members");
  revalidatePath("/admin/team");
  redirect("/admin/team-members");
}

export async function updateTeamMemberAction(id, formData) {
  const data = readForm(formData);
  if (!data.name || !data.teamId) return;

  const existing = await getTeamMember(id);
  const uploaded = await uploadImage(formData.get("photoFile"), "team");
  if (uploaded) {
    await deleteImage(existing?.photo);
    data.photo = uploaded;
  } else {
    data.photo = existing?.photo || null;
  }

  await updateTeamMember(id, data);

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/admin/team-members");
  revalidatePath("/admin/team");
  redirect("/admin/team-members");
}

export async function deleteTeamMemberAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  const existing = await getTeamMember(id);
  await deleteImage(existing?.photo);
  await deleteTeamMember(id);

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/admin/team-members");
  revalidatePath("/admin/team");
  redirect("/admin/team-members");
}
