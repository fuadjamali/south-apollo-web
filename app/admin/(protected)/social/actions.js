"use server";

import { revalidatePath } from "next/cache";
import { updateSocialSettings, SOCIAL_PLATFORMS } from "@/lib/socialSettings";

export async function updateSocialSettingsAction(prevState, formData) {
  const whatsappNumber = formData.get("whatsappNumber")?.toString().trim();
  const whatsappMessage = formData.get("whatsappMessage")?.toString().trim();
  const footerWhatsappMessage = formData.get("footerWhatsappMessage")?.toString().trim();
  const whatsappGroupUrl = formData.get("whatsappGroupUrl")?.toString().trim();

  const socialUrls = {};
  const socialEnabled = {};
  for (const platform of SOCIAL_PLATFORMS) {
    socialUrls[platform.key] = formData.get(platform.key)?.toString().trim();
    socialEnabled[platform.enabledKey] = formData.get(platform.enabledKey) === "on";
  }

  await updateSocialSettings({
    whatsappNumber,
    whatsappMessage,
    footerWhatsappMessage,
    whatsappGroupUrl,
    socialUrls,
    socialEnabled,
  });

  // Both WhatsApp buttons and the social icon row only render on the home page.
  revalidatePath("/");
  revalidatePath("/admin/social");

  return { success: "Social & WhatsApp settings saved." };
}
