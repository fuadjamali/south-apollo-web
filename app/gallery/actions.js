"use server";

import { getPhotosPage } from "@/lib/gallery";

// Called directly from GalleryGrid (a client component) for infinite scroll — same
// direct-server-action-call pattern as reorderHeroSlidesAction, not a form submission.
export async function loadGalleryPageAction(params) {
  return getPhotosPage(params);
}
