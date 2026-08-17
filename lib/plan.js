// Per-deployment tier gating. Each client gets their own Vercel deployment (same pattern as
// DATABASE_URL/NEXTAUTH_SECRET/etc — a separate env var per install), so PLAN just needs to be
// set once per deployment, not per-request. Unset defaults to "premium" so existing/dev
// deployments keep every feature working exactly as before this was added.
export const PLAN = (process.env.PLAN || "premium").toLowerCase();

// Cumulative — each tier includes everything the one below it has. Products and Portfolio are
// deliberately not module-gated: Basic clients get one of the two enabled via the existing
// config/site.js null-toggle (a content decision made at onboarding), not a code-level split,
// since gating "only one of two near-identical showcase types" isn't worth the complexity.
const PLUS_MODULES = [
  "blog",
  "newsEvents",
  "gallery",
  "reviews",
  "partners",
  "team",
  "certifications",
  "themes",
  "ai",
  "booking",
];
const PREMIUM_MODULES = [...PLUS_MODULES, "cart", "members"];

const TIER_MODULES = {
  basic: [],
  plus: PLUS_MODULES,
  premium: PREMIUM_MODULES,
};

export function isModuleEnabled(moduleName) {
  const allowed = TIER_MODULES[PLAN] ?? TIER_MODULES.premium;
  return allowed.includes(moduleName);
}

// config/site.js keys that map 1:1 to a gated module.
const CONFIG_KEY_TO_MODULE = {
  blog: "blog",
  newsEvents: "newsEvents",
  gallery: "gallery",
  reviews: "reviews",
  partners: "partners",
  team: "team",
  certifications: "certifications",
};

// Shallow copy of siteConfig with any section belonging to a disabled module forced to null —
// every section in app/page.js already renders behind a `{section && (...)}` check (the
// existing "set to null to remove this section" convention), so this makes plan gating work
// without touching any of that JSX.
export function getEffectiveSiteConfig(config) {
  const effective = { ...config };
  for (const [key, moduleName] of Object.entries(CONFIG_KEY_TO_MODULE)) {
    if (!isModuleEnabled(moduleName)) {
      effective[key] = null;
    }
  }
  return effective;
}

// Admin routes gated by module — anything not listed here is always reachable (core sections:
// dashboard, products, portfolio, stats, how-it-works, about, contact, enquiries, analytics,
// account). Checked by prefix, so "/admin/team" also covers "/admin/team-members". NOTE:
// "/admin/member-resets" does NOT start with "/admin/members" as a string (they diverge at
// "s" vs "-"), so it needs its own explicit entry rather than relying on the members prefix.
const ADMIN_ROUTE_MODULES = [
  { prefix: "/admin/blog", module: "blog" },
  { prefix: "/admin/gallery", module: "gallery" },
  { prefix: "/admin/news-events", module: "newsEvents" },
  { prefix: "/admin/reviews", module: "reviews" },
  { prefix: "/admin/partners", module: "partners" },
  { prefix: "/admin/team", module: "team" },
  { prefix: "/admin/certifications", module: "certifications" },
  { prefix: "/admin/member-resets", module: "members" },
  { prefix: "/admin/orders", module: "cart" },
  { prefix: "/admin/members", module: "members" },
  { prefix: "/admin/booking-services", module: "booking" },
  { prefix: "/admin/availability", module: "booking" },
  { prefix: "/admin/bookings", module: "booking" },
  { prefix: "/admin/discount-codes", module: "cart" },
  { prefix: "/admin/testimonials", module: "reviews" },
  { prefix: "/admin/account-closures", module: "members" },
  { prefix: "/admin/booking-waitlist", module: "booking" },
  { prefix: "/admin/ai-settings", module: "ai" },
];

export function isAdminPathEnabled(pathname) {
  const match = ADMIN_ROUTE_MODULES.find((r) => pathname.startsWith(r.prefix));
  return match ? isModuleEnabled(match.module) : true;
}

// Public routes gated by module — same idea, checked in proxy.js before admin-vs-public
// routing decisions are made.
const PUBLIC_ROUTE_MODULES = [
  { prefix: "/blog", module: "blog" },
  { prefix: "/gallery", module: "gallery" },
  { prefix: "/news-events", module: "newsEvents" },
  { prefix: "/team", module: "team" },
  { prefix: "/cart", module: "cart" },
  { prefix: "/checkout", module: "cart" },
  { prefix: "/order-confirmation", module: "cart" },
  { prefix: "/member", module: "members" },
  { prefix: "/membership", module: "members" },
  { prefix: "/booking", module: "booking" },
  { prefix: "/leave-a-review", module: "reviews" },
];

// Some nav items point at an in-page anchor on the home page (e.g. "#reviews") rather than a
// real route — those can't be matched by prefix, so they're gated by exact fragment instead.
// Only anchors whose section is module-gated need an entry here; "#products"/"#portfolio"/
// "#about"/"#how-it-works"/"#enquiry"/"#contact" are never module-gated (core sections) and
// are deliberately absent.
const ANCHOR_MODULES = {
  "#reviews": "reviews",
  "#certifications": "certifications",
};

export function isPublicPathEnabled(path) {
  if (path in ANCHOR_MODULES) {
    return isModuleEnabled(ANCHOR_MODULES[path]);
  }
  const match = PUBLIC_ROUTE_MODULES.find((r) => path.startsWith(r.prefix));
  return match ? isModuleEnabled(match.module) : true;
}

// Admin nav item hrefs gated by module, for filtering config/site.js's admin.nav in
// AdminLayout. Keyed the same way as ADMIN_ROUTE_MODULES but as an exact-match lookup since
// nav hrefs are exact, not prefixes.
const NAV_HREF_MODULES = {
  "/admin/blog": "blog",
  "/admin/gallery": "gallery",
  "/admin/news-events": "newsEvents",
  "/admin/reviews": "reviews",
  "/admin/partners": "partners",
  "/admin/team": "team",
  "/admin/team-members": "team",
  "/admin/certifications": "certifications",
  "/admin/orders": "cart",
  "/admin/members": "members",
  "/admin/member-resets": "members",
  "/admin/booking-services": "booking",
  "/admin/availability": "booking",
  "/admin/bookings": "booking",
  "/admin/discount-codes": "cart",
  "/admin/testimonials": "reviews",
  "/admin/account-closures": "members",
  "/admin/booking-waitlist": "booking",
  "/admin/ai-settings": "ai",
};

export function isNavItemEnabled(href) {
  const moduleName = NAV_HREF_MODULES[href];
  return moduleName ? isModuleEnabled(moduleName) : true;
}
