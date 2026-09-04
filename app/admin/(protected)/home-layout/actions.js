"use server";

import { revalidatePath } from "next/cache";
import { setHomeLayout, DEFAULT_SECTION_ORDER, LAYOUT_NAMES } from "@/lib/homeLayout";

export async function updateHomeLayoutAction(prevState, formData) {
  const requested = formData.get("layoutName")?.toString();
  const layoutName = LAYOUT_NAMES.includes(requested) ? requested : "default";

  let sectionOrder = DEFAULT_SECTION_ORDER;
  if (layoutName === "custom" || layoutName === "sidebar") {
    try {
      const parsed = JSON.parse(formData.get("sectionOrder")?.toString() || "[]");
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return { error: "Something went wrong reading the order — try again." };
      }
      sectionOrder = parsed;
    } catch {
      return { error: "Something went wrong reading the order — try again." };
    }
  }

  const asidePosition = formData.get("asidePosition")?.toString();
  const contentWidth = formData.get("contentWidth")?.toString();
  let asideContent = [];
  try {
    const parsed = JSON.parse(formData.get("asideContent")?.toString() || "[]");
    if (Array.isArray(parsed)) asideContent = parsed;
  } catch {
    // setHomeLayout falls back to DEFAULT_ASIDE_CONTENT for an empty/invalid array.
  }

  await setHomeLayout({ layoutName, sectionOrder, asidePosition, asideContent, contentWidth });

  // Only the home page's section order changes — revalidate that, not "layout" broadly.
  revalidatePath("/");
  revalidatePath("/admin/home-layout");

  const messages = {
    custom: "Custom layout saved.",
    sidebar: "Sidebar layout saved.",
    default: "Reset to the default layout.",
  };
  return { success: messages[layoutName] };
}
