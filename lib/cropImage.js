// Renders a cropped + rotated region of an image to a canvas and exports it as a Blob —
// the standard recipe for react-easy-crop's onCropComplete output (croppedAreaPixels), used by
// components/ImageCropModal.js. Runs entirely client-side; only the final result gets uploaded.

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function rotatedBoundingBox(width, height, rotation) {
  const rad = toRadians(rotation);
  return {
    width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
    height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
  };
}

// Minimum zoom needed so a crop box of the given aspect ratio (width/height), after the image
// inside it is rotated by `rotationDegrees`, still has the image fully covering every corner —
// no gaps. Derived from requiring both crop-box corners (w,h) and (h,w) to stay inside the
// rotated, scaled image rectangle: s(θ) = |cosθ| + |sinθ| · max(aspect, 1/aspect). At θ=45°
// and aspect=1 (square) this gives √2, the standard "square rotated 45° needs √2 scale to
// still cover itself" result. Used to clamp the crop tool's zoom so straightening or 90°
// rotating never reveals a gap at the crop box's corners, verified up to the ±45° extreme.
export function minZoomForRotation(rotationDegrees, aspectRatio) {
  const rad = toRadians(rotationDegrees);
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const spread = Math.max(aspectRatio, 1 / aspectRatio);
  return cos + sin * spread;
}

export function getImageNaturalSize(url) {
  return createImage(url).then((image) => ({ width: image.width, height: image.height }));
}

// Caps the longest edge of the exported image so a huge source photo doesn't produce an
// unnecessarily large upload — gallery photos don't need to be print-resolution.
const MAX_OUTPUT_EDGE = 1600;

// Below this, treat the export as failed rather than silently uploading a broken image — a
// real JPEG is always at least a few hundred bytes, even for a tiny solid-color crop. This
// catches the case where the crop tool's container hadn't finished measuring itself yet (e.g.
// the browser tab was backgrounded during the crop interaction), which otherwise produces a
// 0×0 canvas and a near-empty blob that looks like a "successful" upload right up until the
// image fails to display. Caught for real during testing — see git history for this comment.
const MIN_VALID_BLOB_BYTES = 200;

export async function getCroppedImageBlob(imageSrc, pixelCrop, rotation = 0) {
  if (!pixelCrop || !(pixelCrop.width > 0) || !(pixelCrop.height > 0)) {
    throw new Error(
      "The crop area wasn't ready yet — please adjust the crop slightly and try again."
    );
  }

  const image = await createImage(imageSrc);

  const rotateCanvas = document.createElement("canvas");
  const rotateCtx = rotateCanvas.getContext("2d");
  const bbox = rotatedBoundingBox(image.width, image.height, rotation);
  rotateCanvas.width = bbox.width;
  rotateCanvas.height = bbox.height;

  rotateCtx.translate(bbox.width / 2, bbox.height / 2);
  rotateCtx.rotate(toRadians(rotation));
  rotateCtx.translate(-image.width / 2, -image.height / 2);
  rotateCtx.drawImage(image, 0, 0);

  let { width: cropWidth, height: cropHeight } = pixelCrop;
  const longestEdge = Math.max(cropWidth, cropHeight);
  const scale = longestEdge > MAX_OUTPUT_EDGE ? MAX_OUTPUT_EDGE / longestEdge : 1;

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = Math.round(cropWidth * scale);
  outputCanvas.height = Math.round(cropHeight * scale);
  const outputCtx = outputCanvas.getContext("2d");

  outputCtx.drawImage(
    rotateCanvas,
    pixelCrop.x,
    pixelCrop.y,
    cropWidth,
    cropHeight,
    0,
    0,
    outputCanvas.width,
    outputCanvas.height
  );

  const blob = await new Promise((resolve) => {
    outputCanvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
  });

  if (!blob || blob.size < MIN_VALID_BLOB_BYTES) {
    throw new Error("Cropping produced an invalid image — please try again.");
  }

  return blob;
}
