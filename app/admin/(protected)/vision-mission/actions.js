"use server";

import { revalidatePath } from "next/cache";
import { getVisionMissionInfo, updateVisionMissionInfo } from "@/lib/visionMissionInfo";
import { uploadImage, deleteImage } from "@/lib/blob";

export async function updateVisionMissionInfoAction(prevState, formData) {
  const heading = formData.get("heading")?.toString().trim();
  if (!heading) {
    return { error: "Heading can't be empty." };
  }

  const existing = await getVisionMissionInfo();
  const removeImage = formData.get("removeImage") === "on";
  const uploaded = await uploadImage(formData.get("imageFile"), "vision-mission");

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

  await updateVisionMissionInfo({
    heading,
    body: formData.get("body")?.toString().trim(),
    image,
    imagePosition: formData.get("imagePosition")?.toString(),
    overlayStrength: formData.get("overlayStrength")?.toString(),
    textStyle: formData.get("textStyle")?.toString(),
  });

  revalidatePath("/");
  revalidatePath("/admin/vision-mission");

  return { success: "Vision & Mission section saved." };
}
