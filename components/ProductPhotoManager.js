"use client";

import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import {
  addProductPhotoAction,
  setCoverPhotoAction,
  updatePhotoOrderAction,
  deleteProductPhotoAction,
} from "@/app/admin/(protected)/products/actions";
import ImageCropModal from "@/components/ImageCropModal";
import { getImageNaturalSize } from "@/lib/cropImage";

const MAX_PHOTOS = 8;
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

// Client-side direct-to-Blob upload (see app/api/upload-product-photo/route.js for why this
// bypasses the usual Server Action file-upload pattern every other admin image field uses).
// Selected files are cropped one at a time (see components/ImageCropModal.js) before any
// upload happens — only the cropped result ever reaches the server.
export default function ProductPhotoManager({ productId, photos: initialPhotos }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [queue, setQueue] = useState([]); // files still waiting to be cropped
  const [cropping, setCropping] = useState(null); // { file, objectUrl } currently in the modal
  const [uploading, setUploading] = useState(false);
  // True while a set-cover/delete/reorder request is in flight — disables those controls on
  // every card so a rapid double-click can't fire two overlapping mutations. The backend
  // (lib/productPhotos.js) is transactionally safe against this either way, but this avoids
  // confusing optimistic-UI flicker while both requests are still in flight.
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const remaining = MAX_PHOTOS - photos.length - queue.length - (cropping ? 1 : 0);

  function advanceQueue(nextQueue) {
    if (nextQueue.length === 0) {
      setCropping(null);
      setQueue([]);
      return;
    }
    const [next, ...rest] = nextQueue;
    setCropping(next);
    setQueue(rest);
  }

  function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    setError("");

    const toQueue = files.slice(0, remaining);
    if (files.length > toQueue.length) {
      setError(
        `Only ${remaining} more photo${remaining === 1 ? "" : "s"} can be added (${MAX_PHOTOS} max) — the rest weren't queued.`
      );
    }

    const valid = [];
    for (const file of toQueue) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError((prev) => `${prev ? prev + " " : ""}"${file.name}" isn't a supported image type.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(
          (prev) =>
            `${prev ? prev + " " : ""}"${file.name}" is over the 8MB limit for gallery photos.`
        );
        continue;
      }
      valid.push({ file, objectUrl: URL.createObjectURL(file) });
    }

    if (valid.length === 0) return;
    if (cropping) {
      setQueue((prev) => [...prev, ...valid]);
    } else {
      advanceQueue(valid);
    }
  }

  async function uploadPhoto(file, aspectRatio) {
    const uploaded = await upload(`product-photos/${productId}/${Date.now()}-${file.name}`, file, {
      access: "public",
      handleUploadUrl: "/api/upload-product-photo",
    });
    const photo = await addProductPhotoAction(productId, uploaded.url, aspectRatio);
    setPhotos((prev) => [...prev, photo]);
  }

  async function handleCropDone(blob, ratioKey) {
    const current = cropping;
    setUploading(true);
    try {
      const croppedFile = new File([blob], current.file.name.replace(/\.\w+$/, ".jpg"), {
        type: "image/jpeg",
      });
      await uploadPhoto(croppedFile, ratioKey);
    } catch (err) {
      setError((prev) => `${prev ? prev + " " : ""}${err.message || "Upload failed."}`);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(current.objectUrl);
      advanceQueue(queue);
    }
  }

  // Uploads the picked file exactly as-is, no crop/rotate applied — the display box then uses
  // the image's own natural aspect ratio (see lib/photoAspectRatios.js's cssRatio fallback)
  // instead of one of the 3 presets, since forcing an uncropped photo into a preset shape
  // would just letterbox or distort it.
  async function handleUseOriginal() {
    const current = cropping;
    setUploading(true);
    try {
      const { width, height } = await getImageNaturalSize(current.objectUrl);
      await uploadPhoto(current.file, (width / height).toFixed(4));
    } catch (err) {
      setError((prev) => `${prev ? prev + " " : ""}${err.message || "Upload failed."}`);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(current.objectUrl);
      advanceQueue(queue);
    }
  }

  function handleCropSkip() {
    const current = cropping;
    URL.revokeObjectURL(current.objectUrl);
    advanceQueue(queue);
  }

  async function handleSetCover(photoId) {
    setMutating(true);
    try {
      const formData = new FormData();
      formData.set("productId", productId);
      formData.set("photoId", photoId);
      await setCoverPhotoAction(formData);
      setPhotos((prev) => prev.map((p) => ({ ...p, is_cover: p.id === photoId })));
    } finally {
      setMutating(false);
    }
  }

  async function handleOrderChange(photoId, value) {
    const displayOrder = parseInt(value, 10) || 0;
    setPhotos((prev) =>
      prev
        .map((p) => (p.id === photoId ? { ...p, display_order: displayOrder } : p))
        .sort((a, b) => a.display_order - b.display_order || a.id - b.id)
    );
    const formData = new FormData();
    formData.set("productId", productId);
    formData.set("photoId", photoId);
    formData.set("displayOrder", displayOrder);
    await updatePhotoOrderAction(formData);
  }

  async function handleDelete(photo) {
    if (!window.confirm("Delete this photo? This can't be undone.")) return;
    setMutating(true);
    try {
      const formData = new FormData();
      formData.set("productId", productId);
      formData.set("photoId", photo.id);
      formData.set("imageUrl", photo.image);
      await deleteProductPhotoAction(formData);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } finally {
      setMutating(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">
          Photos ({photos.length}/{MAX_PHOTOS})
        </label>
      </div>
      <p className="mt-1 text-xs text-muted">
        The star marks the cover photo shown on the home page and product list. Up to {MAX_PHOTOS}{" "}
        photos, 8MB each. Each photo is cropped before it's added.
      </p>

      {photos.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="rounded-lg border border-border p-2">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.image}
                  alt=""
                  className="h-24 w-full rounded-md object-cover"
                />
                {photo.is_cover && (
                  <span className="absolute left-1 top-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                    Cover
                  </span>
                )}
              </div>

              <div className="mt-2 flex items-center gap-1">
                <input
                  type="number"
                  defaultValue={photo.display_order}
                  onBlur={(e) => handleOrderChange(photo.id, e.target.value)}
                  className="w-14 rounded-md border border-border bg-surface px-1.5 py-1 text-xs text-foreground"
                  title="Display order"
                />
                {!photo.is_cover && (
                  <button
                    type="button"
                    onClick={() => handleSetCover(photo.id)}
                    disabled={mutating}
                    className="flex-1 rounded-md border border-border px-1.5 py-1 text-[11px] font-medium text-foreground hover:bg-surface-alt disabled:opacity-50"
                  >
                    Set cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(photo)}
                  disabled={mutating}
                  className="rounded-md border border-border px-1.5 py-1 text-[11px] font-medium text-red-600 hover:bg-surface-alt disabled:opacity-50 dark:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {remaining > 0 && (
        <div className="mt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            disabled={uploading || !!cropping}
            onChange={handleFiles}
            className="text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary-foreground disabled:opacity-50"
          />
          {uploading && <p className="mt-1 text-xs text-muted">Uploading…</p>}
          {queue.length > 0 && (
            <p className="mt-1 text-xs text-muted">{queue.length} more photo(s) waiting to crop…</p>
          )}
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
        >
          {error}
        </p>
      )}

      {cropping && (
        <ImageCropModal
          imageSrc={cropping.objectUrl}
          fileName={cropping.file.name}
          onDone={handleCropDone}
          onUseOriginal={handleUseOriginal}
          onSkip={handleCropSkip}
        />
      )}
    </div>
  );
}
