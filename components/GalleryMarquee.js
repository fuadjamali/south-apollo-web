"use client";

import { useEffect, useState } from "react";
import { ASPECT_RATIOS } from "@/lib/photoAspectRatios";
import GalleryLightbox from "@/components/GalleryLightbox";

const SECONDS_PER_PHOTO = 4.5;
const CARD_HEIGHT_PX = 224; // h-56

function cardCssRatio(photo) {
  return ASPECT_RATIOS[photo.aspect_ratio]?.cssRatio || "1 / 1";
}

// Home page gallery preview — an auto-scrolling filmstrip, not a one-at-a-time fade carousel.
// The track renders `photos` TWICE, concatenated, and animates exactly one copy's width
// (translateX 0 → -50%); since both halves are pixel-identical, the loop point is invisible, no
// reset/easing hack needed. Falls back to a plain static, horizontally-scrollable row — no
// animation at all — for a single photo or under prefers-reduced-motion. Clicking any card opens
// the same lightbox /gallery's masonry grid uses (components/GalleryLightbox.js).
export default function GalleryMarquee({ photos }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (photos.length === 0) return null;

  const animated = photos.length > 1 && !reducedMotion;
  const trackPhotos = animated ? [...photos, ...photos] : photos;
  const durationMs = photos.length * SECONDS_PER_PHOTO * 1000;

  function Card({ photo, i }) {
    return (
      <button
        type="button"
        onClick={() => setLightboxIndex(i % photos.length)}
        className="group relative shrink-0 overflow-hidden rounded-xl border border-border shadow-sm transition hover:shadow-md"
        style={{ height: CARD_HEIGHT_PX, aspectRatio: cardCssRatio(photo) }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.image}
          alt={photo.caption || ""}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        {photo.caption && (
          <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-left text-xs text-white opacity-0 transition group-hover:opacity-100">
            {photo.caption}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="overflow-hidden">
      {animated && (
        <style>{`
          @keyframes gallery-marquee-scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .gallery-marquee-track:hover {
            animation-play-state: paused;
          }
        `}</style>
      )}
      <div
        className={`flex gap-4 ${animated ? "gallery-marquee-track w-max" : "overflow-x-auto pb-2"}`}
        style={
          animated
            ? {
                animationName: "gallery-marquee-scroll",
                animationDuration: `${durationMs}ms`,
                animationTimingFunction: "linear",
                animationIterationCount: "infinite",
              }
            : undefined
        }
      >
        {trackPhotos.map((photo, i) => (
          <Card key={`${photo.id}-${i}`} photo={photo} i={i} />
        ))}
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          photos={photos}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
