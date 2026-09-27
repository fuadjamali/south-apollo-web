"use server";

import { revalidatePath } from "next/cache";
import { getHistoryInfo, updateHistoryInfo } from "@/lib/historyInfo";
import { uploadImage, deleteImage } from "@/lib/blob";

export async function updateHistoryInfoAction(prevState, formData) {
  const heading = formData.get("heading")?.toString().trim();
  if (!heading) {
    return { error: "Heading can't be empty." };
  }

  const existing = await getHistoryInfo();
  const removeImage = formData.get("removeImage") === "on";
  const uploaded = await uploadImage(formData.get("imageFile"), "history");

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

  await updateHistoryInfo({
    heading,
    headingBn: formData.get("headingBn")?.toString().trim(),
    body: formData.get("body")?.toString().trim(),
    image,
    imagePosition: formData.get("imagePosition")?.toString(),
    overlayStrength: formData.get("overlayStrength")?.toString(),
    textStyle: formData.get("textStyle")?.toString(),
  });

  revalidatePath("/");
  revalidatePath("/admin/history");

  return { success: "History section saved." };
}
