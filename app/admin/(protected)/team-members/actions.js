"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createTeamMember, updateTeamMember, deleteTeamMember } from "@/lib/teamMembers";

function readForm(formData) {
  return {
    personId: formData.get("personId") ? parseInt(formData.get("personId"), 10) : null,
    title: formData.get("title")?.toString().trim() || "",
    serviceJoinDate: formData.get("serviceJoinDate")?.toString().trim() || "",
    serviceEndDate: formData.get("serviceEndDate")?.toString().trim() || "",
    teamId: formData.get("teamId") ? parseInt(formData.get("teamId"), 10) : null,
    active: formData.get("active") === "on",
    showOnHome: formData.get("showOnHome") === "on",
    isFormer: formData.get("isFormer") === "on",
  };
}

// Builds the redirect target for the admin list, carrying the ?team= filter forward (so a
// save doesn't reset it — see components/TeamMembersList.js) and appending ?error=duplicate
// when the active-membership guard blocked the save, per docs/team-people-internals.md: a
// blocked save redirects back to the list with a banner, rather than a silent no-op.
function redirectPath(returnTeam, error) {
  const params = new URLSearchParams();
  if (returnTeam) params.set("team", returnTeam);
  if (error) params.set("error", error);
  const query = params.toString();
  return `/admin/team-members${query ? `?${query}` : ""}`;
}

export async function createTeamMemberAction(formData) {
  const data = readForm(formData);
  const returnTeam = formData.get("returnTeam")?.toString() || "";
  if (!data.personId || !data.teamId) return;

  try {
    await createTeamMember(data);
  } catch (err) {
    if (err.message === "duplicate") {
      redirect(redirectPath(returnTeam, "duplicate"));
    }
    throw err;
  }

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/admin/team-members");
  revalidatePath("/admin/team");
  redirect(redirectPath(returnTeam));
}

export async function updateTeamMemberAction(id, formData) {
  const data = readForm(formData);
  const returnTeam = formData.get("returnTeam")?.toString() || "";
  if (!data.personId || !data.teamId) return;

  try {
    await updateTeamMember(id, data);
  } catch (err) {
    if (err.message === "duplicate") {
      redirect(redirectPath(returnTeam, "duplicate"));
    }
    throw err;
  }

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/admin/team-members");
  revalidatePath("/admin/team");
  redirect(redirectPath(returnTeam));
}

export async function deleteTeamMemberAction(formData) {
  const id = formData.get("id");
  if (!id) return;
  const returnTeam = formData.get("returnTeam")?.toString() || "";

  await deleteTeamMember(id);

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/admin/team-members");
  revalidatePath("/admin/team");
  redirect(redirectPath(returnTeam));
}
