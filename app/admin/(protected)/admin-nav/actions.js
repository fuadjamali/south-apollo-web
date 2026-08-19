"use server";

import { revalidatePath } from "next/cache";
import {
  createAdminNavItem,
  updateAdminNavItem,
  deleteAdminNavItem,
} from "@/lib/adminNavItems";

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/admin-nav");
}

// kind: "group" (top-level, no href) | "link" (top-level, has href) | "child" (inside a group —
// needs parentId).
export async function createAdminNavItemAction(prevState, formData) {
  const kind = formData.get("kind")?.toString();
  const label = formData.get("label")?.toString().trim();
  if (!label) return { error: "Label can't be empty." };

  const href = formData.get("href")?.toString().trim();
  if (kind !== "group" && !href) return { error: "Needs a link (e.g. /admin/something)." };

  const parentIdRaw = formData.get("parentId")?.toString();
  await createAdminNavItem({
    parentId: kind === "child" ? Number(parentIdRaw) : null,
    label,
    href: kind === "group" ? null : href,
  });

  refresh();
  return { success: `"${label}" added.` };
}

export async function updateAdminNavItemAction(prevState, formData) {
  const id = Number(formData.get("id"));
  const isGroup = formData.get("isGroup") === "on";
  const label = formData.get("label")?.toString().trim();
  if (!label) return { error: "Label can't be empty." };

  const href = formData.get("href")?.toString().trim();
  if (!isGroup && !href) return { error: "Needs a link (e.g. /admin/something)." };

  await updateAdminNavItem(id, {
    label,
    href: isGroup ? null : href,
    displayOrder: Number(formData.get("displayOrder")) || 0,
  });

  refresh();
  return { success: `"${label}" saved.` };
}

export async function deleteAdminNavItemAction(formData) {
  const id = Number(formData.get("id"));
  await deleteAdminNavItem(id);
  refresh();
}
