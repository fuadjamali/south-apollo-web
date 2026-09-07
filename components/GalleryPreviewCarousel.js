"use client";

import { useEffect, useState } from "react";

const AUTOPLAY_MS = 4000;

// Auto-advancing single-photo carousel for the home page's gallery preview — the full grid
// with filters/lightbox lives at /gallery (components/GalleryGrid.js); this is just a lightweight
// teaser, so no lightbox/swipe/keyboard here, only autoplay + dots + pause-on-hover, same
// reduced-motion/tab-hidden gating as HeroCarousel for consistency.
export default function GalleryPreviewCarousel({ photos }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (photos.length <= 1 || paused || reducedMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % photos.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [photos.length, paused, reducedMotion]);

  const photo = photos[index];

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-gray-100 shadow-sm dark:bg-gray-800">
        {photos.map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={p.id}
            src={p.image}
            alt={p.caption || ""}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
      {photo?.caption && <p className="mt-3 text-center text-sm text-muted">{photo.caption}</p>}
      {photos.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to photo ${i + 1}`}
              aria-current={i === index}
              className={`h-2 w-2 rounded-full transition ${
                i === index ? "bg-primary" : "bg-border hover:bg-muted"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
