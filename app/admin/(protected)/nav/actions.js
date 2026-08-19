"use server";

import { revalidatePath } from "next/cache";
import { createNavItem, updateNavItem, deleteNavItem } from "@/lib/navItems";

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/nav");
}

// kind: "group" (top-level, no href) | "link" (top-level, has href, cta/highlight allowed) |
// "child" (inside a group — needs parentId, no cta/highlight).
export async function createNavItemAction(prevState, formData) {
  const kind = formData.get("kind")?.toString();
  const label = formData.get("label")?.toString().trim();
  if (!label) return { error: "Label can't be empty." };

  const href = formData.get("href")?.toString().trim();
  if (kind !== "group" && !href) return { error: "Needs a link (URL or #anchor)." };

  const parentIdRaw = formData.get("parentId")?.toString();
  await createNavItem({
    parentId: kind === "child" ? Number(parentIdRaw) : null,
    label,
    href: kind === "group" ? null : href,
    cta: kind === "link" && formData.get("cta") === "on",
    highlight: kind === "link" && formData.get("highlight") === "on",
  });

  refresh();
  return { success: `"${label}" added.` };
}

export async function updateNavItemAction(prevState, formData) {
  const id = Number(formData.get("id"));
  const isGroup = formData.get("isGroup") === "on";
  const isChild = formData.get("isChild") === "on";
  const label = formData.get("label")?.toString().trim();
  if (!label) return { error: "Label can't be empty." };

  const href = formData.get("href")?.toString().trim();
  if (!isGroup && !href) return { error: "Needs a link (URL or #anchor)." };

  await updateNavItem(id, {
    label,
    href: isGroup ? null : href,
    cta: !isGroup && !isChild && formData.get("cta") === "on",
    highlight: !isGroup && !isChild && formData.get("highlight") === "on",
    displayOrder: Number(formData.get("displayOrder")) || 0,
  });

  refresh();
  return { success: `"${label}" saved.` };
}

export async function deleteNavItemAction(formData) {
  const id = Number(formData.get("id"));
  await deleteNavItem(id);
  refresh();
}
