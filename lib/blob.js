import { put, del } from "@vercel/blob";

const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024; // Server actions cap request bodies at 4.5MB on Vercel.

// Uploads an image File (from a server action's FormData) to Vercel Blob and
// returns its public URL. `folder` groups uploads by feature, e.g. "products".
export async function uploadImage(file, folder) {
  if (!file || typeof file === "string" || file.size === 0) return null;

  if (!file.type?.startsWith("image/")) {
    throw new Error("Only image files can be uploaded.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image is too large — please upload a file under 4.5MB.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
  const blob = await put(`${folder}/${Date.now()}-${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
    // Explicit token bypasses @vercel/blob's OIDC auto-detection, which fails
    // locally whenever VERCEL_OIDC_TOKEN is present but OIDC isn't enabled for
    // the "development" environment on this project.
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return blob.url;
}

// Same shape as uploadImage, for a hero slide's optional background video — a short, muted,
// looping clip instead of a static image. Vercel still caps a server action's request body at
// 4.5MB regardless of media type, which is a real constraint for video (documented in the
// admin form's help text) but not one this template works around — trimming/compressing before
// upload is on the admin.
export async function uploadVideo(file, folder) {
  if (!file || typeof file === "string" || file.size === 0) return null;

  if (!file.type?.startsWith("video/")) {
    throw new Error("Only video files can be uploaded.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      "Video is too large — please upload a file under 4.5MB (a short, muted, looping clip works best)."
    );
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
  const blob = await put(`${folder}/${Date.now()}-${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return blob.url;
}

// Best-effort delete — swallows errors so a missing/already-deleted blob (or a
// stored value that isn't actually a Blob URL, e.g. a legacy /public path)
// never blocks the surrounding create/update/delete flow.
export async function deleteImage(url) {
  if (!url || !url.includes(".public.blob.vercel-storage.com/")) return;

  try {
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch (err) {
    console.error("Failed to delete blob:", url, err);
  }
}
