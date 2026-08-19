"use server";

import { revalidatePath } from "next/cache";
import { getHeroInfo, updateHeroInfo } from "@/lib/heroInfo";
import { uploadImage, deleteImage } from "@/lib/blob";

export async function updateHeroInfoAction(prevState, formData) {
  const heading = formData.get("heading")?.toString().trim();
  if (!heading) {
    return { error: "Heading can't be empty." };
  }

  const existing = await getHeroInfo();
  const removeImage = formData.get("removeBackgroundImage") === "on";
  const uploaded = await uploadImage(formData.get("backgroundImageFile"), "hero");

  let backgroundImage;
  if (uploaded) {
    await deleteImage(existing?.background_image);
    backgroundImage = uploaded;
  } else if (removeImage) {
    await deleteImage(existing?.background_image);
    backgroundImage = null;
  } else {
    backgroundImage = existing?.background_image || null;
  }

  await updateHeroInfo({
    heading,
    subheading: formData.get("subheading")?.toString().trim(),
    backgroundImage,
    primaryCtaLabel: formData.get("primaryCtaLabel")?.toString().trim(),
    primaryCtaHref: formData.get("primaryCtaHref")?.toString().trim(),
    secondaryCtaLabel: formData.get("secondaryCtaLabel")?.toString().trim(),
    secondaryCtaHref: formData.get("secondaryCtaHref")?.toString().trim(),
    overlayStrength: formData.get("overlayStrength")?.toString(),
    textStyle: formData.get("textStyle")?.toString(),
  });

  revalidatePath("/");
  revalidatePath("/admin/hero");

  return { success: "Hero section saved." };
}
