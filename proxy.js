import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isAdminPathEnabled, isPublicPathEnabled } from "@/lib/plan";

const PUBLIC_ROUTES = ["/", "/admin/login", "/robots.txt", "/sitemap.xml", "/membership"];
const PUBLIC_PREFIXES = [
  "/api/auth",
  "/api/enquiries",
  "/api/track-visit",
  "/api/verify-membership",
  "/blog",
  "/products",
  "/news-events",
  "/gallery",
  "/team",
  "/cart",
  "/checkout",
  "/order-confirmation",
  "/booking",
  "/booking-confirmation",
  "/leave-a-review",
  // Member auth routes are self-protecting: app/member/(protected)/layout.js does its own
  // getMemberSession() redirect server-side, so this proxy doesn't need to gate them (member
  // sessions use a separate signed cookie, not the admin NextAuth token checked below).
  "/member",
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
  "/admin/subscription",
  "/admin/subscription/compare",
  "/admin/member-resets",
  "/admin/account-closures",
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
  "/admin/partners",
  "/admin/news-events",
  "/admin/stats",
  "/admin/how-it-works",
  "/admin/gallery",
  "/admin/orders",
  "/admin/portfolio",
  "/admin/certifications",
  "/admin/booking-services",
  "/admin/availability",
  "/admin/bookings",
  "/admin/discount-codes",
  "/admin/testimonials",
  "/admin/booking-waitlist",
];

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.includes(pathname) || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    // A route can be on the public allowlist and still belong to a module this deployment's
    // plan doesn't include (e.g. /blog on a Basic-tier site) — treat that the same as an
    // unrecognized route rather than rendering it.
    if (!isPublicPathEnabled(pathname)) {
      return NextResponse.rewrite(new URL("/site-unavailable", request.url), { status: 401 });
    }
    return NextResponse.next();
  }

  if (
    PROTECTED_ROUTES.includes(pathname) ||
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    // Same plan check for admin routes — a module outside the plan is unreachable regardless
    // of auth, not just hidden from the nav.
    if (!isAdminPathEnabled(pathname)) {
      return NextResponse.rewrite(new URL("/site-unavailable", request.url), { status: 401 });
    }

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
