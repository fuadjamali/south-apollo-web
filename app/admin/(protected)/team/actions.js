"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createTeam, updateTeam, deleteTeam } from "@/lib/teams";

function readForm(formData) {
  return {
    name: formData.get("name")?.toString().trim() || "",
    description: formData.get("description")?.toString().trim() || "",
    displayOrder: parseInt(formData.get("displayOrder"), 10) || 0,
    showOnHome: formData.get("showOnHome") === "on",
    isFormer: formData.get("isFormer") === "on",
  };
}

export async function createTeamAction(formData) {
  const data = readForm(formData);
  if (!data.name) return;

  await createTeam(data);

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/admin/team");
  redirect("/admin/team");
}

export async function updateTeamAction(id, formData) {
  const data = readForm(formData);
  if (!data.name) return;

  await updateTeam(id, data);

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/admin/team");
  redirect("/admin/team");
}

export async function deleteTeamAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  // Cascades to team_members (ON DELETE CASCADE) — the admin UI's confirm dialog
  // warns about this before the request is ever sent.
  await deleteTeam(id);

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/admin/team");
  revalidatePath("/admin/team-members");
  redirect("/admin/team");
}
