// Client-side "get this file under the server's size cap" pass, run before the crop step even
// opens (components/ImageFileInput.js) — a user should never have to go compress a phone photo
// themselves first just because Vercel caps a Server Action's request body at 4.5MB. Runs
// entirely in the browser; nothing here ever touches the network.
//
// Strategy: re-encode as JPEG at decreasing quality first (cheapest, no visible size change),
// then fall back to shrinking dimensions ~15% per pass (only once quality alone can't hit the
// target) down to a floor of 800px on the longest edge. Always returns the smallest attempt made,
// even if it never quite got under maxBytes — the caller decides whether that's good enough.
const QUALITY_STEPS = [0.9, 0.8, 0.7, 0.6, 0.5];
const DIMENSION_SHRINK_FACTOR = 0.85;
const DEFAULT_FLOOR_DIMENSION = 800;
const DEFAULT_MAX_BYTES = 4.5 * 1024 * 1024;

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = url;
  });
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

function renameToJpg(fileName) {
  return fileName.replace(/\.\w+$/, ".jpg");
}

// Returns the original `file` untouched if it's not an image or is already under `maxBytes` —
// compression only ever runs when it's actually needed.
export async function compressImageFile(
  file,
  { maxBytes = DEFAULT_MAX_BYTES, floorDimension = DEFAULT_FLOOR_DIMENSION } = {}
) {
  if (!file.type?.startsWith("image/")) return file;
  if (file.size <= maxBytes) return file;

  const objectUrl = URL.createObjectURL(file);
  let image;
  try {
    image = await loadImage(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  let width = image.width;
  let height = image.height;
  let smallestBlob = null;

  while (true) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width);
    canvas.height = Math.round(height);
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);

    for (const quality of QUALITY_STEPS) {
      const blob = await canvasToBlob(canvas, quality);
      if (!blob) continue;
      if (!smallestBlob || blob.size < smallestBlob.size) smallestBlob = blob;
      if (blob.size <= maxBytes) {
        return new File([blob], renameToJpg(file.name), { type: "image/jpeg" });
      }
    }

    const longestEdge = Math.max(width, height);
    if (longestEdge <= floorDimension) break; // hit the floor — nothing more to try
    const nextLongestEdge = Math.max(floorDimension, longestEdge * DIMENSION_SHRINK_FACTOR);
    const factor = nextLongestEdge / longestEdge;
    width *= factor;
    height *= factor;
  }

  // Never got under maxBytes even at the floor dimension — hand back the smallest attempt made
  // (never the original oversized file) so the caller can at least try the upload, or show an
  // accurate "still too large" size in its own error message.
  return smallestBlob ? new File([smallestBlob], renameToJpg(file.name), { type: "image/jpeg" }) : file;
}
