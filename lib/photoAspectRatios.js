// Extracted from lib/productPhotos.js so client components (components/ImageCropModal.js,
// components/ProductGallery.js) can import it without pulling in lib/db.js's server-only `pg`
// driver — see lib/socialPlatforms.js for the same split, done for the same reason.
export const ASPECT_RATIOS = {
  "1:1": { value: 1, cssRatio: "1 / 1", label: "Square (1:1)" },
  "4:5": { value: 4 / 5, cssRatio: "4 / 5", label: "Portrait (4:5)" },
  "16:9": { value: 16 / 9, cssRatio: "16 / 9", label: "Landscape (16:9)" },
};

export const DEFAULT_ASPECT_RATIO = "1:1";
