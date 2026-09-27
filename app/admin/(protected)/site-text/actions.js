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

  await updateCookieConsentText({
    message,
    acceptLabel,
    declineLabel,
    bn: {
      message: formData.get("messageBn")?.toString().trim(),
      acceptLabel: formData.get("acceptLabelBn")?.toString().trim(),
      declineLabel: formData.get("declineLabelBn")?.toString().trim(),
    },
  });
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

  await updateSiteUnavailableText({
    errorCodeLabel,
    heading,
    message,
    bn: {
      errorCodeLabel: formData.get("errorCodeLabelBn")?.toString().trim(),
      heading: formData.get("headingBn")?.toString().trim(),
      message: formData.get("messageBn")?.toString().trim(),
    },
  });
  revalidatePath("/site-unavailable");
  revalidatePath("/admin/site-text");
  return { success: "Site Unavailable page saved." };
}
