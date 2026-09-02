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

// Caps the longest edge of the exported image so a huge source photo doesn't produce an
// unnecessarily large upload — gallery photos don't need to be print-resolution.
const MAX_OUTPUT_EDGE = 1600;

export async function getCroppedImageBlob(imageSrc, pixelCrop, rotation = 0) {
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

  return new Promise((resolve) => {
    outputCanvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
  });
}
