"use server";

import { revalidatePath } from "next/cache";
import { getBranding, updateBranding } from "@/lib/branding";
import { uploadImage, deleteImage } from "@/lib/blob";

// Shared by all three image fields: upload wins if a file was chosen, otherwise the "remove"
// checkbox clears it, otherwise the existing value is kept untouched.
async function resolveImage(formData, fileField, removeField, existingUrl) {
  const removeImage = formData.get(removeField) === "on";
  const uploaded = await uploadImage(formData.get(fileField), "branding");

  if (uploaded) {
    await deleteImage(existingUrl);
    return uploaded;
  }
  if (removeImage) {
    await deleteImage(existingUrl);
    return null;
  }
  return existingUrl || null;
}

export async function updateBrandingAction(prevState, formData) {
  const existing = await getBranding();

  const [logoUrl, logoDarkUrl, faviconUrl, appleIconUrl] = await Promise.all([
    resolveImage(formData, "logoFile", "removeLogo", existing?.logo_url),
    resolveImage(formData, "logoDarkFile", "removeLogoDark", existing?.logo_dark_url),
    resolveImage(formData, "faviconFile", "removeFavicon", existing?.favicon_url),
    resolveImage(formData, "appleIconFile", "removeAppleIcon", existing?.apple_icon_url),
  ]);

  await updateBranding({ logoUrl, logoDarkUrl, faviconUrl, appleIconUrl });

  // The logo shows up on every page (via LogoContext, populated in the root layout) and the
  // favicon/apple-icon are read in generateMetadata — revalidate broadly.
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");

  return { success: "Branding saved." };
}
