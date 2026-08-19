"use server";

import { revalidatePath } from "next/cache";
import { updateLegalPage, LEGAL_PAGE_SLUGS } from "@/lib/legalPages";

export async function updateLegalPageAction(prevState, formData) {
  const slug = formData.get("slug")?.toString();
  if (!LEGAL_PAGE_SLUGS.includes(slug)) {
    return { error: "Unknown legal page." };
  }

  const title = formData.get("title")?.toString().trim();
  if (!title) {
    return { error: "Title can't be empty." };
  }

  await updateLegalPage(slug, {
    title,
    body: formData.get("body")?.toString().trim(),
    enabled: formData.get("enabled") === "on",
  });

  revalidatePath(`/${slug}`);
  revalidatePath("/");
  revalidatePath("/admin/legal");

  return { success: `${title} saved.` };
}
