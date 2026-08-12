"use server";

import { revalidatePath } from "next/cache";
import { updateContactInfo } from "@/lib/contactInfo";

export async function updateContactInfoAction(formData) {
  const heading = formData.get("heading")?.toString().trim() || "Contact Us";
  const subheading = formData.get("subheading")?.toString().trim() || "";
  const address = formData.get("address")?.toString().trim() || "";
  const phone = formData.get("phone")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim() || "";
  const enabled = formData.get("enabled") === "on";

  await updateContactInfo({ heading, subheading, address, phone, email, enabled });

  // Revalidate immediately rather than waiting for the home page's ISR window.
  revalidatePath("/");
  revalidatePath("/admin/contact");
}
