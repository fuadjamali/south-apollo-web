"use client";

import { useEffect, useState } from "react";
import { IconX, IconChevronLeft, IconChevronRight, IconZoomIn, IconZoomOut } from "@tabler/icons-react";

// Full-screen photo viewer — arrow-key/button navigation between the currently-loaded photos,
// click-to-toggle 2x zoom (simpler than a full pinch/drag rig like ProductGallery's, which is
// built around a single product's own thumbnail strip; this needs to work across a masonry grid
// of dozens of photos instead). Index is controlled by the parent (GalleryGrid) so "next" past
// the last loaded photo can trigger loading more rather than just stopping.
export default function GalleryLightbox({ photos, index, onIndexChange, onClose }) {
  const [zoomed, setZoomed] = useState(false);
  const photo = photos[index];

  useEffect(() => {
    setZoomed(false);
  }, [index]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndexChange(Math.min(index + 1, photos.length - 1));
      if (e.key === "ArrowLeft") onIndexChange(Math.max(index - 1, 0));
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, photos.length, onIndexChange, onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex items-center justify-between p-4">
        <p className="truncate pr-4 text-sm text-white/80">{photo.caption}</p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            aria-label={zoomed ? "Zoom out" : "Zoom in"}
            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            {zoomed ? <IconZoomOut size={20} /> : <IconZoomIn size={20} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <IconX size={20} />
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-auto px-4 pb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.image}
          alt={photo.caption || ""}
          onClick={() => setZoomed((z) => !z)}
          className={`rounded-lg transition-transform duration-200 ${
            zoomed
              ? "max-w-none scale-150 cursor-zoom-out"
              : "max-h-full max-w-full cursor-zoom-in object-contain"
          }`}
        />

        {index > 0 && (
          <button
            type="button"
            onClick={() => onIndexChange(index - 1)}
            aria-label="Previous photo"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <IconChevronLeft size={24} />
          </button>
        )}
        {index < photos.length - 1 && (
          <button
            type="button"
            onClick={() => onIndexChange(index + 1)}
            aria-label="Next photo"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <IconChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
