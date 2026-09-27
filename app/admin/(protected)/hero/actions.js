"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getHeroSlide,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  setHeroSlideOrder,
  toggleHeroSlideActive,
  updateHeroSettings,
} from "@/lib/heroSlides";
import { uploadImage, uploadVideo, deleteImage } from "@/lib/blob";

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/hero");
}

// Resolves this submission's media fields against `existing` (null on create). Handles the
// image<->video switch cleanly: whichever kind the slide *used* to be, if the new save picked
// the other kind, that old file gets deleted rather than left orphaned in Blob storage with
// nothing left pointing at it.
async function resolveMedia(formData, existing) {
  const mediaType = formData.get("mediaType")?.toString() === "video" ? "video" : "image";

  if (mediaType === "video") {
    const removeVideo = formData.get("removeBackgroundVideo") === "on";
    const uploadedVideo = await uploadVideo(formData.get("backgroundVideoFile"), "hero");

    let backgroundVideo;
    if (uploadedVideo) {
      await deleteImage(existing?.background_video);
      backgroundVideo = uploadedVideo;
    } else if (removeVideo) {
      await deleteImage(existing?.background_video);
      backgroundVideo = null;
    } else {
      backgroundVideo = existing?.background_video || null;
    }

    if (existing && existing.media_type !== "video") {
      await deleteImage(existing.background_image);
      await deleteImage(existing.background_image_mobile);
    }

    return { mediaType, backgroundImage: null, backgroundImageMobile: null, backgroundVideo };
  }

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

  const removeMobileImage = formData.get("removeBackgroundImageMobile") === "on";
  const uploadedMobile = await uploadImage(formData.get("backgroundImageMobileFile"), "hero");

  let backgroundImageMobile;
  if (uploadedMobile) {
    await deleteImage(existing?.background_image_mobile);
    backgroundImageMobile = uploadedMobile;
  } else if (removeMobileImage) {
    await deleteImage(existing?.background_image_mobile);
    backgroundImageMobile = null;
  } else {
    backgroundImageMobile = existing?.background_image_mobile || null;
  }

  if (existing && existing.media_type === "video") {
    await deleteImage(existing.background_video);
  }

  return { mediaType, backgroundImage, backgroundImageMobile, backgroundVideo: null };
}

function readCommon(formData) {
  return {
    heading: formData.get("heading")?.toString().trim(),
    subheading: formData.get("subheading")?.toString().trim(),
    primaryCtaLabel: formData.get("primaryCtaLabel")?.toString().trim(),
    primaryCtaHref: formData.get("primaryCtaHref")?.toString().trim(),
    secondaryCtaLabel: formData.get("secondaryCtaLabel")?.toString().trim(),
    secondaryCtaHref: formData.get("secondaryCtaHref")?.toString().trim(),
    headingBn: formData.get("headingBn")?.toString().trim(),
    subheadingBn: formData.get("subheadingBn")?.toString().trim(),
    primaryCtaLabelBn: formData.get("primaryCtaLabelBn")?.toString().trim(),
    secondaryCtaLabelBn: formData.get("secondaryCtaLabelBn")?.toString().trim(),
    overlayStrength: formData.get("overlayStrength")?.toString(),
    textStyle: formData.get("textStyle")?.toString(),
    active: formData.get("active") === "on",
    focalPosition: formData.get("focalPosition"),
  };
}

export async function createHeroSlideAction(formData) {
  const heading = formData.get("heading")?.toString().trim();
  if (!heading) return;

  const media = await resolveMedia(formData, null);
  await createHeroSlide({ ...readCommon(formData), ...media });

  refresh();
  redirect("/admin/hero");
}

export async function updateHeroSlideAction(id, formData) {
  const heading = formData.get("heading")?.toString().trim();
  if (!heading) return;

  const existing = await getHeroSlide(id);
  const media = await resolveMedia(formData, existing);
  await updateHeroSlide(id, { ...readCommon(formData), ...media });

  refresh();
  redirect("/admin/hero");
}

export async function deleteHeroSlideAction(formData) {
  const id = Number(formData.get("id"));
  const slide = await getHeroSlide(id);
  if (slide) {
    await deleteImage(slide.background_image);
    await deleteImage(slide.background_image_mobile);
    await deleteImage(slide.background_video);
  }
  await deleteHeroSlide(id);
  refresh();
}

// Called directly from NavReorderableList (a client component) — same reuse as Site Navigation's
// reorder action. That component's signature is (parentId, orderedIds); hero slides have no
// nesting, so parentId is always ignored here.
export async function reorderHeroSlidesAction(_parentId, orderedIds) {
  await setHeroSlideOrder(orderedIds);
  refresh();
}

export async function toggleHeroSlideActiveAction(formData) {
  const id = Number(formData.get("id"));
  const active = formData.get("active") === "true";
  await toggleHeroSlideActive(id, active);
  refresh();
}

// The global hero container height (lib/heroSlides.js's hero_settings singleton) — separate
// from the per-slide form/actions above since it applies to the whole carousel box, not any one
// slide. Stays on the same list page (app/admin/(protected)/hero/page.js) rather than a
// standalone route since there's only one field.
export async function updateHeroSettingsAction(prevState, formData) {
  const heightPx = formData.get("heightPx")?.toString().trim();
  await updateHeroSettings({ heightPx });
  refresh();
  return { success: "Hero height saved." };
}
