import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = ["/", "/admin/login", "/robots.txt", "/sitemap.xml", "/membership"];
const PUBLIC_PREFIXES = [
  "/api/auth",
  "/api/enquiries",
  "/api/track-visit",
  "/api/verify-membership",
  "/blog",
  "/products",
];

// Explicit allowlist, not a "/admin" prefix match — a path here means a real
// page.js exists for it. Add new admin routes here as they're built; anything
// under /admin that ISN'T listed falls through to the unrecognized-route branch
// (401 Site Unavailable) rather than silently 404ing via Next's default page.
const PROTECTED_ROUTES = [
  "/admin",
  "/admin/enquiries",
  "/admin/analytics",
  "/admin/contact",
  "/admin/about",
  "/admin/account",
];

// For admin route trees that legitimately have dynamic children (e.g. /admin/products/[id]/edit),
// an exact-match list doesn't work — use a prefix match instead, scoped to just that subtree.
// "/admin/team" also covers "/admin/team-members*" (string prefix match), so one entry protects both.
const PROTECTED_PREFIXES = [
  "/admin/products",
  "/admin/blog",
  "/admin/reviews",
  "/admin/team",
  "/admin/members",
];

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (
    PROTECTED_ROUTES.includes(pathname) ||
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL("/site-unavailable", request.url), { status: 401 });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|site-unavailable|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
