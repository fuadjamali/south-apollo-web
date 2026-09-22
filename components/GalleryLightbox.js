"use client";

import { useEffect, useRef, useState } from "react";
import { IconX, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

const MAX_ZOOM = 3;

function distance(touches) {
  const [a, b] = touches;
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

// Full-screen photo viewer shared by the masonry grid (/gallery) and the home page's filmstrip
// (components/GalleryMarquee.js). Zoom/pan/pinch math adapted from components/ProductGallery.js's
// lightbox — same clamped-scale, drag-to-pan-once-zoomed, two-finger-pinch recipe, generalized
// here to browse across `photos` (parent-controlled `index`) instead of one product's own photo
// set. Index is controlled by the parent so "next" past the last loaded photo can trigger loading
// more rather than just stopping (see GalleryGrid's infinite scroll).
export default function GalleryLightbox({ photos, index, onIndexChange, onClose }) {
  const [zoom, setZoom] = useState({ scale: 1, x: 0, y: 0 });
  const [zoomedIndex, setZoomedIndex] = useState(index);
  const dragState = useRef(null);
  const pinchState = useRef(null);
  const overlayRef = useRef(null);
  const closeButtonRef = useRef(null);
  const photo = photos[index];

  // Resets zoom when the photo changes — done during render (not an effect) per React's
  // "adjusting state when a prop changes" pattern, since this is just derived state, not a sync
  // with an external system.
  if (zoomedIndex !== index) {
    setZoomedIndex(index);
    setZoom({ scale: 1, x: 0, y: 0 });
  }

  function clampZoom(next) {
    const scale = Math.min(MAX_ZOOM, Math.max(1, next.scale));
    return scale === 1 ? { scale: 1, x: 0, y: 0 } : { ...next, scale };
  }

  function goTo(next) {
    onIndexChange(Math.min(Math.max(next, 0), photos.length - 1));
  }

  // Focus trap: Tab/Shift+Tab cycle within the overlay's own focusable controls instead of
  // escaping to the page behind it — Escape/arrows already work the instant the overlay opens
  // (no extra click needed first) since the container itself grabs focus on mount below.
  function handleKeyDown(e) {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key === "ArrowRight") goTo(index + 1);
    if (e.key === "ArrowLeft") goTo(index - 1);
    if (e.key !== "Tab") return;

    const focusable = overlayRef.current?.querySelectorAll(
      'button, [href], input, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  useEffect(() => {
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
      dragState.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, origin: zoom };
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

  if (!photo) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex items-center justify-between p-4">
        <p className="truncate pr-4 text-sm text-white/80">
          {photo.caption}
          {photos.length > 1 && (
            <span className={photo.caption ? "ml-2 text-white/50" : "text-white/50"}>
              {index + 1} / {photos.length}
            </span>
          )}
        </p>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        >
          <IconX size={20} />
        </button>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-4"
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
          src={photo.image}
          alt={photo.caption || ""}
          draggable={false}
          className="max-h-full max-w-full select-none rounded-lg object-contain"
          style={{
            transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})`,
            cursor: zoom.scale > 1 ? "grab" : "zoom-in",
            transition: dragState.current || pinchState.current ? "none" : "transform 0.15s ease-out",
          }}
        />

        {index > 0 && (
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous photo"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <IconChevronLeft size={24} />
          </button>
        )}
        {index < photos.length - 1 && (
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next photo"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <IconChevronRight size={24} />
          </button>
        )}
      </div>

      <p className="pb-3 text-center text-xs text-white/60">
        Scroll or pinch to zoom · double-click to reset
      </p>
    </div>
  );
}
