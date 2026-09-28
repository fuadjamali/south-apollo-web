import { put, del } from "@vercel/blob";
import sharp from "sharp";

const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024; // Server actions cap request bodies at 4.5MB on Vercel.
const COMPRESSED_MAX_DIMENSION = 2000; // px, longest edge — plenty for full-bleed display, well under typical camera/phone output

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

// Same contract as uploadImage, but re-encodes through sharp first: downscales to at most
// COMPRESSED_MAX_DIMENSION on the longest edge and re-encodes as quality-82 JPEG (or WebP if the
// original already was one — no format upgrade to a smaller output pushed onto every browser
// this template supports). Scoped to the gallery for now rather than folded into uploadImage
// itself — a browsing-heavy grid of dozens of photos is where upload-time compression actually
// pays for itself; other single-photo fields (hero, products, logo) keep uploadImage's
// upload-as-is behavior rather than risk quietly changing already-shipped, already-tested paths.
export async function uploadImageCompressed(file, folder) {
  if (!file || typeof file === "string" || file.size === 0) return null;

  if (!file.type?.startsWith("image/")) {
    throw new Error("Only image files can be uploaded.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image is too large — please upload a file under 4.5MB.");
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const toWebp = file.type === "image/webp";
  let pipeline = sharp(inputBuffer)
    .rotate() // apply EXIF orientation before resizing, then strip it — avoids a sideways image
    .resize({
      width: COMPRESSED_MAX_DIMENSION,
      height: COMPRESSED_MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });
  pipeline = toWebp ? pipeline.webp({ quality: 82 }) : pipeline.jpeg({ quality: 82, mozjpeg: true });
  const outputBuffer = await pipeline.toBuffer();

  const safeName = file.name.replace(/\.\w+$/, toWebp ? ".webp" : ".jpg").replace(/[^a-zA-Z0-9.-]/g, "-");
  const blob = await put(`${folder}/${Date.now()}-${safeName}`, outputBuffer, {
    access: "public",
    addRandomSuffix: true,
    contentType: toWebp ? "image/webp" : "image/jpeg",
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

// Logos: resized to at most LOGO_MAX_HEIGHT px tall (plenty for the largest place a logo is
// shown — the 96px site header — on a 3x screen) and re-encoded as a palette PNG, which keeps
// transparency. A phone-camera or print-resolution upload was otherwise served at full size on
// every page (the original 4494x1617 logo was 565KB). SVGs are already small and scale freely,
// so they go through as-is.
const LOGO_MAX_HEIGHT = 300;

export async function uploadLogoImage(file, folder) {
  if (!file || typeof file === "string" || file.size === 0) return null;
  if (file.type === "image/svg+xml") return uploadImage(file, folder);

  if (!file.type?.startsWith("image/")) {
    throw new Error("Only image files can be uploaded.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image is too large — please upload a file under 4.5MB.");
  }

  const outputBuffer = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize({ height: LOGO_MAX_HEIGHT, withoutEnlargement: true })
    .png({ palette: true, quality: 92, compressionLevel: 9 })
    .toBuffer();

  const safeName = file.name.replace(/\.\w+$/, ".png").replace(/[^a-zA-Z0-9.-]/g, "-");
  const blob = await put(`${folder}/${Date.now()}-${safeName}`, outputBuffer, {
    access: "public",
    addRandomSuffix: true,
    contentType: "image/png",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return blob.url;
}
