"use server";

import { revalidatePath } from "next/cache";
import { updateAboutInfo } from "@/lib/aboutInfo";

export async function updateAboutInfoAction(formData) {
  const heading = formData.get("heading")?.toString().trim() || "About Us";
  const body = formData.get("body")?.toString().trim() || "";

  await updateAboutInfo({ heading, body });

  // Revalidate immediately rather than waiting for the home page's ISR window.
  revalidatePath("/");
  revalidatePath("/admin/about");
}
