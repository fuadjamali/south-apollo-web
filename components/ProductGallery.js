"use client";

import { useRef, useState } from "react";
import { IconX, IconZoomIn } from "@tabler/icons-react";
import { ASPECT_RATIOS } from "@/lib/photoAspectRatios";

const MAX_ZOOM = 3;
const DEFAULT_CSS_RATIO = "1 / 1";

function distance(touches) {
  const [a, b] = touches;
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

// Thumbnail strip + main image on the public product page, with a click-to-zoom lightbox
// (scroll/pinch to zoom, drag to pan) rather than an Amazon-style hover magnifier — hover-zoom
// does nothing on a touch device, which is most of this traffic.
export default function ProductGallery({ photos, productName }) {
  // Opens on the cover photo, not just whichever photo happens to sort first — those can
  // differ once an admin sets a different photo as cover without reordering the gallery.
  const [index, setIndex] = useState(() => {
    const coverIndex = photos.findIndex((p) => p.is_cover);
    return coverIndex >= 0 ? coverIndex : 0;
  });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState({ scale: 1, x: 0, y: 0 });
  const dragState = useRef(null);
  const pinchState = useRef(null);

  if (photos.length === 0) {
    return (
      <div className="aspect-video overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 sm:aspect-square" />
    );
  }

  const current = photos[index];

  function openLightbox(i) {
    setIndex(i);
    setZoom({ scale: 1, x: 0, y: 0 });
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
    setZoom({ scale: 1, x: 0, y: 0 });
  }

  function clampZoom(next) {
    const scale = Math.min(MAX_ZOOM, Math.max(1, next.scale));
    return scale === 1 ? { scale: 1, x: 0, y: 0 } : { ...next, scale };
  }

  function handleWheel(e) {
    e.preventDefault();
    setZoom((prev) => clampZoom({ ...prev, scale: prev.scale - e.deltaY * 0.0015 }));
  }

  function handleDoubleClick() {
    setZoom((prev) => (prev.scale > 1 ? { scale: 1, x: 0, y: 0 } : { scale: 2.2, x: 0, y: 0 }));
  }

  function handleMouseDown(e) {
    if (zoom.scale === 1) return;
    dragState.current = { startX: e.clientX, startY: e.clientY, origin: zoom };
  }

  function handleMouseMove(e) {
    if (!dragState.current) return;
    const { startX, startY, origin } = dragState.current;
    setZoom(
      clampZoom({
        scale: origin.scale,
        x: origin.x + (e.clientX - startX),
        y: origin.y + (e.clientY - startY),
      })
    );
  }

  function handleMouseUp() {
    dragState.current = null;
  }

  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      pinchState.current = { startDist: distance(e.touches), origin: zoom };
    } else if (e.touches.length === 1 && zoom.scale > 1) {
      dragState.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        origin: zoom,
      };
    }
  }

  function handleTouchMove(e) {
    if (e.touches.length === 2 && pinchState.current) {
      e.preventDefault();
      const { startDist, origin } = pinchState.current;
      const ratio = distance(e.touches) / startDist;
      setZoom(clampZoom({ ...origin, scale: origin.scale * ratio }));
    } else if (e.touches.length === 1 && dragState.current) {
      e.preventDefault();
      const { startX, startY, origin } = dragState.current;
      setZoom(
        clampZoom({
          scale: origin.scale,
          x: origin.x + (e.touches[0].clientX - startX),
          y: origin.y + (e.touches[0].clientY - startY),
        })
      );
    }
  }

  function handleTouchEnd(e) {
    if (e.touches.length < 2) pinchState.current = null;
    if (e.touches.length < 1) dragState.current = null;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => openLightbox(index)}
        style={{ aspectRatio: ASPECT_RATIOS[current.aspect_ratio]?.cssRatio || DEFAULT_CSS_RATIO }}
        className="group relative block w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.image}
          alt={productName}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
          <IconZoomIn size={14} /> Zoom
        </span>
      </button>

      {photos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {photos.map((photo, i) => (
            <button
              key={photo.id ?? i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                i === index ? "border-primary" : "border-transparent hover:border-border"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close"
            className="absolute right-4 top-4 z-20 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <IconX size={20} />
          </button>

          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {photos.map((photo, i) => (
                <button
                  key={photo.id ?? i}
                  type="button"
                  onClick={() => {
                    setIndex(i);
                    setZoom({ scale: 1, x: 0, y: 0 });
                  }}
                  className={`h-2 w-2 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`}
                  aria-label={`Photo ${i + 1}`}
                />
              ))}
            </div>
          )}

          <div
            className="h-full w-full overflow-hidden"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.image}
              alt={productName}
              draggable={false}
              className="h-full w-full select-none object-contain"
              style={{
                transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})`,
                cursor: zoom.scale > 1 ? "grab" : "zoom-in",
                transition: dragState.current || pinchState.current ? "none" : "transform 0.15s ease-out",
              }}
            />
          </div>

          <p className="absolute bottom-4 right-4 hidden text-xs text-white/60 sm:block">
            Scroll or pinch to zoom · double-click to reset
          </p>
        </div>
      )}
    </div>
  );
}
