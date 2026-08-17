"use server";

import { revalidatePath } from "next/cache";
import { updateAISettings } from "@/lib/aiSettings";

export async function updateAISettingsAction(prevState, formData) {
  const enabled = formData.get("enabled") === "on";
  const clearKey = formData.get("clearKey") === "on";
  const newKey = formData.get("apiKey")?.toString().trim();

  // undefined = leave the stored key untouched, null = clear it, string = replace it.
  let apiKey;
  if (clearKey) {
    apiKey = null;
  } else if (newKey) {
    apiKey = newKey;
  }

  await updateAISettings({ enabled, apiKey });

  revalidatePath("/admin/ai-settings");
  return { success: "AI Assistant settings saved." };
}
