"use server";

import { revalidatePath } from "next/cache";
import { setHomeLayout, DEFAULT_SECTION_ORDER } from "@/lib/homeLayout";

export async function updateHomeLayoutAction(prevState, formData) {
  const layoutName = formData.get("layoutName")?.toString() === "custom" ? "custom" : "default";

  let sectionOrder = DEFAULT_SECTION_ORDER;
  if (layoutName === "custom") {
    try {
      const parsed = JSON.parse(formData.get("sectionOrder")?.toString() || "[]");
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return { error: "Something went wrong reading the custom order — try again." };
      }
      sectionOrder = parsed;
    } catch {
      return { error: "Something went wrong reading the custom order — try again." };
    }
  }

  await setHomeLayout({ layoutName, sectionOrder });

  // Only the home page's section order changes — revalidate that, not "layout" broadly.
  revalidatePath("/");
  revalidatePath("/admin/home-layout");

  return { success: layoutName === "custom" ? "Custom layout saved." : "Reset to the default layout." };
}
