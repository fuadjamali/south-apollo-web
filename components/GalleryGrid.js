"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import GalleryLightbox from "@/components/GalleryLightbox";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const searchFieldClass =
  "w-full max-w-sm rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";
const selectFieldClass =
  "rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground focus:border-accent focus:outline-none";

function pillClassName(active) {
  return `rounded-full border px-3 py-1.5 text-sm font-medium transition ${
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border text-foreground hover:bg-surface-alt"
  }`;
}

// Calls the /api/gallery-photos route (app/api/gallery-photos/route.js), which wraps
// lib/gallery.js's getPhotosPage() — a plain GET rather than a Server Action, so pagination is
// reachable the same way from outside this Next app if that's ever needed.
async function fetchGalleryPage(params) {
  const query = new URLSearchParams();
  if (params.cursor) query.set("cursor", params.cursor);
  if (params.tag) query.set("tag", params.tag);
  if (params.year) query.set("year", params.year);
  if (params.month) query.set("month", params.month);
  if (params.search) query.set("search", params.search);
  const res = await fetch(`/api/gallery-photos?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to load photos");
  return res.json();
}

// Pinterest-style masonry via CSS multi-column layout (columns-N + break-inside-avoid on each
// item) rather than a JS masonry library — no measuring/layout-thrashing, and it degrades to a
// perfectly normal single column on mobile for free. Infinite scroll watches a sentinel div with
// IntersectionObserver and fetches the next page from /api/gallery-photos.
export default function GalleryGrid({ initialPhotos, initialNextCursor, allTags, allMonths }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [tag, setTag] = useState("");
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef(null);
  const requestId = useRef(0);
  const searchDebounceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  // Year first, Month only once a year is picked (and scoped to that year's own months) —
  // rather than one combined "March 2026" dropdown, so the Month select can show each month's
  // own photo count right in the option label.
  const years = [...new Set(allMonths.map((m) => m.year))];
  const monthsForYear = year ? allMonths.filter((m) => m.year === year) : [];

  const applyFilters = useCallback(
    (overrides = {}) => {
      const params = {
        tag: overrides.tag !== undefined ? overrides.tag : tag,
        year: overrides.year !== undefined ? overrides.year : year,
        month: overrides.month !== undefined ? overrides.month : month,
        search: overrides.search !== undefined ? overrides.search : search,
      };
      const myRequest = ++requestId.current;
      startTransition(async () => {
        const { photos: page, nextCursor: cursor } = await fetchGalleryPage(params);
        if (myRequest !== requestId.current) return; // a newer filter change superseded this one
        setPhotos(page);
        setNextCursor(cursor);
      });
    },
    [tag, year, month, search]
  );

  function loadMore() {
    if (!nextCursor || isPending) return;
    const myRequest = requestId.current;
    startTransition(async () => {
      const { photos: page, nextCursor: cursor } = await fetchGalleryPage({
        cursor: nextCursor,
        tag,
        year,
        month,
        search,
      });
      if (myRequest !== requestId.current) return;
      setPhotos((prev) => [...prev, ...page]);
      setNextCursor(cursor);
    });
  }

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "800px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextCursor, tag, year, month, search]);

  // Typing debounces (350ms) into an automatic search — no separate submit button or Enter
  // shortcut, matching the plain search-as-you-type input this was matched against.
  function handleSearchInputChange(value) {
    setSearchInput(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearch(value);
      applyFilters({ search: value });
    }, 350);
  }

  return (
    <div>
      <div className="flex justify-center">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => handleSearchInputChange(e.target.value)}
          placeholder="Search captions and tags…"
          aria-label="Search photos"
          className={searchFieldClass}
        />
      </div>

      {(allTags.length > 0 || years.length > 0) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {years.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={year ?? ""}
                onChange={(e) => {
                  const y = e.target.value ? Number(e.target.value) : null;
                  setYear(y);
                  setMonth(null);
                  applyFilters({ year: y, month: null });
                }}
                className={selectFieldClass}
              >
                <option value="">Any year</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              {year && (
                <select
                  value={month ?? ""}
                  onChange={(e) => {
                    const m = e.target.value ? Number(e.target.value) : null;
                    setMonth(m);
                    applyFilters({ month: m });
                  }}
                  className={selectFieldClass}
                >
                  <option value="">Any month</option>
                  {monthsForYear.map((m) => (
                    <option key={m.month} value={m.month}>
                      {MONTH_NAMES[m.month - 1]} ({m.count})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {allTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setTag("");
                  applyFilters({ tag: "" });
                }}
                className={pillClassName(tag === "")}
              >
                All
              </button>
              {allTags.map(({ tag: t, count }) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTag(t);
                    applyFilters({ tag: t });
                  }}
                  className={pillClassName(tag === t)}
                >
                  {t} <span className="opacity-60">({count})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {photos.length === 0 ? (
        <p className={`mt-10 text-center text-muted ${isPending ? "opacity-60" : ""}`}>
          No photos match these filters.
        </p>
      ) : (
        <div className={`mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 ${isPending ? "opacity-60" : ""}`}>
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-border text-left shadow-sm transition hover:shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.image} alt={photo.caption || ""} className="w-full" loading="lazy" />
              {photo.caption && (
                <p className="p-3 text-sm text-muted">{photo.caption}</p>
              )}
            </button>
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />
      {isPending && nextCursor && (
        <p className="mt-6 text-center text-sm text-muted">Loading more…</p>
      )}

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
