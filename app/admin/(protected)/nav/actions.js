"use server";

import { revalidatePath } from "next/cache";
import { createNavItem, updateNavItem, deleteNavItem, setNavItemOrder } from "@/lib/navItems";

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
    labelBn: formData.get("labelBn")?.toString().trim(),
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
    labelBn: formData.get("labelBn")?.toString().trim(),
    href: isGroup ? null : href,
    cta: !isGroup && !isChild && formData.get("cta") === "on",
    highlight: !isGroup && !isChild && formData.get("highlight") === "on",
  });

  refresh();
  return { success: `"${label}" saved.` };
}

export async function deleteNavItemAction(formData) {
  const id = Number(formData.get("id"));
  await deleteNavItem(id);
  refresh();
}

// Called directly from NavReorderableList (a client component), not via a <form action>, so it
// isn't bound by useActionState's (prevState, formData) shape — a drag-and-drop reorder isn't a
// form submission, it's an immediate save the moment a row is dropped, same as a kanban board.
export async function reorderNavItemsAction(parentId, orderedIds) {
  await setNavItemOrder(parentId, orderedIds);
  refresh();
}
