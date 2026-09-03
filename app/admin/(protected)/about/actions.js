"use server";

import { revalidatePath } from "next/cache";
import { getAboutInfo, updateAboutInfo } from "@/lib/aboutInfo";
import { uploadImage, deleteImage } from "@/lib/blob";

export async function updateAboutInfoAction(prevState, formData) {
  const heading = formData.get("heading")?.toString().trim();
  if (!heading) {
    return { error: "Heading can't be empty." };
  }

  const existing = await getAboutInfo();
  const removeImage = formData.get("removeImage") === "on";
  const uploaded = await uploadImage(formData.get("imageFile"), "about");

  let image;
  if (uploaded) {
    await deleteImage(existing?.image);
    image = uploaded;
  } else if (removeImage) {
    await deleteImage(existing?.image);
    image = null;
  } else {
    image = existing?.image || null;
  }

  await updateAboutInfo({
    heading,
    body: formData.get("body")?.toString().trim(),
    image,
    imagePosition: formData.get("imagePosition")?.toString(),
    overlayStrength: formData.get("overlayStrength")?.toString(),
    textStyle: formData.get("textStyle")?.toString(),
  });

  // Revalidate immediately rather than waiting for the home page's ISR window.
  revalidatePath("/");
  revalidatePath("/admin/about");

  return { success: "About Us section saved." };
}
