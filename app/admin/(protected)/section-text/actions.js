"use server";

import { revalidatePath } from "next/cache";
import { updateSectionHeading, SECTION_DEFS } from "@/lib/sectionHeadings";

export async function updateSectionHeadingAction(prevState, formData) {
  const key = formData.get("key")?.toString();
  if (!SECTION_DEFS.some((s) => s.key === key)) {
    return { error: "Unknown section." };
  }

  const heading = formData.get("heading")?.toString().trim();
  if (!heading) {
    return { error: "Heading can't be empty." };
  }

  await updateSectionHeading(key, {
    heading,
    subheading: formData.get("subheading")?.toString().trim(),
    headingBn: formData.get("headingBn")?.toString().trim(),
    subheadingBn: formData.get("subheadingBn")?.toString().trim(),
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/section-text");

  return { success: `${heading} saved.` };
}
