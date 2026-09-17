"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPerson, updatePerson, deletePerson, getPerson } from "@/lib/people";
import { uploadImage, deleteImage } from "@/lib/blob";

function readForm(formData) {
  return {
    idNo: formData.get("idNo")?.toString().trim() || "",
    name: formData.get("name")?.toString().trim() || "",
    contactNo: formData.get("contactNo")?.toString().trim() || "",
    email: formData.get("email")?.toString().trim() || "",
  };
}

export async function createPersonAction(formData) {
  const data = readForm(formData);
  if (!data.name) return;

  data.photo = await uploadImage(formData.get("photoFile"), "people");

  await createPerson(data);

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/admin/people");
  revalidatePath("/admin/team-members");
  redirect("/admin/people");
}

export async function updatePersonAction(id, formData) {
  const data = readForm(formData);
  if (!data.name) return;

  const existing = await getPerson(id);
  const uploaded = await uploadImage(formData.get("photoFile"), "people");
  if (uploaded) {
    await deleteImage(existing?.photo);
    data.photo = uploaded;
  } else {
    data.photo = existing?.photo || null;
  }

  await updatePerson(id, data);

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/admin/people");
  revalidatePath("/admin/team-members");
  redirect("/admin/people");
}

export async function deletePersonAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  // team_members.person_id is ON DELETE CASCADE — deleting a person deletes every one of their
  // team memberships with them. The admin UI's confirm dialog warns about this before this runs.
  const existing = await getPerson(id);
  await deleteImage(existing?.photo);
  await deletePerson(id);

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/admin/people");
  revalidatePath("/admin/team-members");
  redirect("/admin/people");
}
