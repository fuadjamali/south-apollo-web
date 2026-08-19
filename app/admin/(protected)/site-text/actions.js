"use server";

import { revalidatePath } from "next/cache";
import { updateCookieConsentText, updateSiteUnavailableText } from "@/lib/siteText";

export async function updateCookieConsentAction(prevState, formData) {
  const message = formData.get("message")?.toString().trim();
  const acceptLabel = formData.get("acceptLabel")?.toString().trim();
  const declineLabel = formData.get("declineLabel")?.toString().trim();
  if (!message || !acceptLabel || !declineLabel) {
    return { error: "All three fields are required." };
  }

  await updateCookieConsentText({ message, acceptLabel, declineLabel });
  revalidatePath("/");
  revalidatePath("/admin/site-text");
  return { success: "Cookie consent banner saved." };
}

export async function updateSiteUnavailableAction(prevState, formData) {
  const errorCodeLabel = formData.get("errorCodeLabel")?.toString().trim();
  const heading = formData.get("heading")?.toString().trim();
  const message = formData.get("message")?.toString().trim();
  if (!errorCodeLabel || !heading || !message) {
    return { error: "All three fields are required." };
  }

  await updateSiteUnavailableText({ errorCodeLabel, heading, message });
  revalidatePath("/site-unavailable");
  revalidatePath("/admin/site-text");
  return { success: "Site Unavailable page saved." };
}
