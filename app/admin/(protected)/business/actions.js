"use server";

import { revalidatePath } from "next/cache";
import { updateBusinessInfo } from "@/lib/businessInfo";

export async function updateBusinessInfoAction(prevState, formData) {
  const name = formData.get("name")?.toString().trim();
  const tagline = formData.get("tagline")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const domain = formData.get("domain")?.toString().trim();

  if (!name) {
    return { error: "Business name can't be empty." };
  }

  await updateBusinessInfo({ name, tagline, description, domain });

  // The name shows up almost everywhere (browser tab title, every page header, footer
  // copyright, admin header, SEO tags) — revalidate broadly rather than enumerating every path.
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");

  return { success: "Business info saved." };
}
