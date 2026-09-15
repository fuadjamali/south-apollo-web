"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { IconSearch } from "@tabler/icons-react";
import GalleryLightbox from "@/components/GalleryLightbox";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const fieldClass =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

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
  const [yearMonth, setYearMonth] = useState(""); // "YYYY-MM" or ""
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

  const [year, month] = yearMonth ? yearMonth.split("-").map(Number) : [null, null];

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

  // Typing debounces (350ms) into an automatic search — the submit button/Enter is a "search
  // now" shortcut that clears any pending debounce first, so a fast typist who hits Enter never
  // gets a stale debounced fetch landing after the immediate one.
  function handleSearchInputChange(value) {
    setSearchInput(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearch(value);
      applyFilters({ search: value });
    }, 350);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    setSearch(searchInput);
    applyFilters({ search: searchInput });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            placeholder="Search captions & tags…"
            className={`${fieldClass} w-56`}
          />
          <button
            type="submit"
            aria-label="Search"
            className="rounded-lg border border-border p-2 text-foreground hover:bg-surface-alt"
          >
            <IconSearch size={16} />
          </button>
        </form>

        {allMonths.length > 0 && (
          <select
            value={yearMonth}
            onChange={(e) => {
              setYearMonth(e.target.value);
              const [y, m] = e.target.value ? e.target.value.split("-").map(Number) : [null, null];
              applyFilters({ year: y, month: m });
            }}
            className={fieldClass}
          >
            <option value="">All dates</option>
            {allMonths.map(({ year: y, month: m }) => (
              <option key={`${y}-${m}`} value={`${y}-${m}`}>
                {MONTH_NAMES[m - 1]} {y}
              </option>
            ))}
          </select>
        )}
      </div>

      {allTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setTag("");
              applyFilters({ tag: "" });
            }}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              tag === "" ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-surface-alt"
            }`}
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
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                tag === t ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-surface-alt"
              }`}
            >
              {t} <span className="opacity-70">{count}</span>
            </button>
          ))}
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
