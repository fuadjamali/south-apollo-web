"use server";

import { revalidatePath } from "next/cache";
import { getBranding, updateBranding } from "@/lib/branding";
import { uploadImage, uploadLogoImage, deleteImage } from "@/lib/blob";

// Shared by all the image fields: upload wins if a file was chosen, otherwise the "remove"
// checkbox clears it, otherwise the existing value is kept untouched. `upload` lets the two logo
// fields resize and compress (uploadLogoImage) while the icons keep their exact uploaded size.
async function resolveImage(formData, fileField, removeField, existingUrl, upload = uploadImage) {
  const removeImage = formData.get(removeField) === "on";
  const uploaded = await upload(formData.get(fileField), "branding");

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
    resolveImage(formData, "logoFile", "removeLogo", existing?.logo_url, uploadLogoImage),
    resolveImage(formData, "logoDarkFile", "removeLogoDark", existing?.logo_dark_url, uploadLogoImage),
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
