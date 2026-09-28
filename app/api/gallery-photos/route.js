import { NextResponse } from "next/server";
import { getPhotosPage } from "@/lib/gallery";
import { getLocale } from "@/lib/i18n/server";

const MAX_LIMIT = 60;

// Pagination endpoint for the public gallery's masonry grid (components/GalleryGrid.js) — plain
// GET, no auth (the gallery itself is a public route). Registered in proxy.js's PUBLIC_PREFIXES;
// forgetting that step is the exact class of bug this app already hit once for
// app/opengraph-image.js — a route that "exists" in the file tree still 401s without it.
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const cursor = searchParams.get("cursor") ? Number(searchParams.get("cursor")) : undefined;
  const tag = searchParams.get("tag") || undefined;
  const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;
  const month = searchParams.get("month") ? Number(searchParams.get("month")) : undefined;
  const search = searchParams.get("search") || undefined;
  const requestedLimit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;
  const limit = Math.min(MAX_LIMIT, requestedLimit && requestedLimit > 0 ? requestedLimit : 24);

  const locale = await getLocale();
  const { photos, nextCursor } = await getPhotosPage({ cursor, tag, year, month, search, limit, locale });
  return NextResponse.json({ photos, nextCursor });
}
