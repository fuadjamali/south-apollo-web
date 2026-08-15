"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createMember, updateMember, deleteMember } from "@/lib/members";

const VALID_STATUSES = ["Active", "Expired", "Suspended"];

function readForm(formData) {
  const membershipStatus = formData.get("membershipStatus")?.toString().trim() || "";
  return {
    memberId: formData.get("memberId")?.toString().trim() || "",
    firstName: formData.get("firstName")?.toString().trim() || "",
    lastName: formData.get("lastName")?.toString().trim() || "",
    mobileNo: formData.get("mobileNo")?.toString().trim() || "",
    email: formData.get("email")?.toString().trim() || "",
    membershipStatus: VALID_STATUSES.includes(membershipStatus) ? membershipStatus : "Active",
    addressLine1: formData.get("addressLine1")?.toString().trim() || "",
    addressLine2: formData.get("addressLine2")?.toString().trim() || "",
    city: formData.get("city")?.toString().trim() || "",
    postcode: formData.get("postcode")?.toString().trim() || "",
    county: formData.get("county")?.toString().trim() || "",
    country: formData.get("country")?.toString().trim() || "",
    additionalDetails: formData.get("additionalDetails")?.toString().trim() || "",
  };
}

export async function createMemberAction(formData) {
  const data = readForm(formData);
  if (!data.memberId || !data.firstName || !data.lastName) return;

  await createMember(data);

  revalidatePath("/admin/members");
  redirect("/admin/members");
}

export async function updateMemberAction(id, formData) {
  const data = readForm(formData);
  if (!data.memberId || !data.firstName || !data.lastName) return;

  await updateMember(id, data);

  revalidatePath("/admin/members");
  redirect("/admin/members");
}

export async function deleteMemberAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  await deleteMember(id);

  revalidatePath("/admin/members");
  redirect("/admin/members");
}
