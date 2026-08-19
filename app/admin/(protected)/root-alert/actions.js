"use server";

import { revalidatePath } from "next/cache";
import { updateRootAlert } from "@/lib/rootAlert";

export async function updateRootAlertAction(prevState, formData) {
  const enabled = formData.get("enabled") === "on";
  const message = formData.get("message")?.toString().trim();
  if (enabled && !message) {
    return { error: "Message can't be empty while the alert is on." };
  }

  await updateRootAlert({ enabled, message: message || "" });

  revalidatePath("/", "layout");
  revalidatePath("/admin/root-alert");
  return { success: "Root Alert saved." };
}
