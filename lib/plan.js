import { getModuleOverrides } from "@/lib/moduleSettings";

// Per-deployment tier gating. Each client gets their own Vercel deployment (same pattern as
// DATABASE_URL/NEXTAUTH_SECRET/etc — a separate env var per install), so PLAN just needs to be
// set once per deployment, not per-request. Unset defaults to "premium" so existing/dev
// deployments keep every feature working exactly as before this was added.
export const PLAN = (process.env.PLAN || "premium").toLowerCase();

// Baseline home page sections every plan includes, even Basic — never locked by tier, but still
// individually switchable from Feature Config (grouped there as "Core") since an admin may
// legitimately want a leaner page without every one of these.
const CORE_MODULES = [
  "hero",
  "stats",
  "howItWorks",
  "products",
  "portfolio",
  "about",
  "enquiryForm",
  "map",
  "footer",
];

// Cumulative — each tier includes everything the one below it has, plus every CORE_MODULES
// entry (present on every tier). Products and Portfolio are deliberately not SPLIT between
// tiers: Basic clients get one of the two enabled via the existing config/site.js null-toggle (a
// content decision made at onboarding), not a code-level split, since gating "only one of two
// near-identical showcase types" isn't worth the complexity — both stay in CORE_MODULES.
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
  basic: [...CORE_MODULES],
  plus: [...CORE_MODULES, ...PLUS_MODULES],
  premium: [...CORE_MODULES, ...PREMIUM_MODULES],
};

// All module names any tier can include — used to validate admin-controlled overrides so an
// unknown/typo'd module name can't silently do nothing.
export const ALL_MODULES = [...CORE_MODULES, ...PREMIUM_MODULES];

export function isModuleInTier(moduleName) {
  const allowed = TIER_MODULES[PLAN] ?? TIER_MODULES.premium;
  return allowed.includes(moduleName);
}

// Tier sets the ceiling (what this deployment is paying for); the admin-controlled
// module_settings override (lib/moduleSettings.js) can only turn a module further OFF within
// that ceiling, never unlock one the plan doesn't include — so a Basic-tier site can't be
// toggled into Premium features from the admin panel. Computed once per request (one DB read)
// and passed around as a plain {moduleName: boolean} map, so callers doing several checks in a
// row (page.js, proxy.js, the admin layout) don't each trigger their own round trip, and so the
// checks can run synchronously inside Array.filter/map instead of threading async through them.
export async function getModuleStates() {
  const overrides = await getModuleOverrides();
  const states = {};
  for (const moduleName of ALL_MODULES) {
    states[moduleName] = isModuleInTier(moduleName) && overrides[moduleName] !== false;
  }
  return states;
}

// Convenience single-check wrapper for call sites that only need one module's state — costs one
// DB read. Prefer getModuleStates() + isEnabled() below when checking more than one module.
export async function isModuleEnabled(moduleName) {
  const states = await getModuleStates();
  return isEnabled(moduleName, states);
}

// Sync lookup against a states map already fetched via getModuleStates().
export function isEnabled(moduleName, states) {
  return states[moduleName] ?? false;
}

// config/site.js keys that map 1:1 to a gated module. "about" is deliberately absent — its
// content comes from Postgres (lib/aboutInfo.js), not a config/site.js key, so app/page.js
// checks its module state directly instead of going through getEffectiveSiteConfig.
const CONFIG_KEY_TO_MODULE = {
  hero: "hero",
  stats: "stats",
  howItWorks: "howItWorks",
  products: "products",
  portfolio: "portfolio",
  enquiryForm: "enquiryForm",
  map: "map",
  footer: "footer",
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
export function getEffectiveSiteConfig(config, states) {
  const effective = { ...config };
  for (const [key, moduleName] of Object.entries(CONFIG_KEY_TO_MODULE)) {
    if (!isEnabled(moduleName, states)) {
      effective[key] = null;
    }
  }
  return effective;
}

// Admin routes gated by module — anything not listed here is always reachable (dashboard,
// contact, enquiries, analytics, account: none of these have a Feature Config toggle, so they
// stay reachable regardless of what else is switched off — otherwise turning off "Contact Us"
// could lock the admin out of the one page that turns it back on). Checked by prefix, so
// "/admin/team" also covers "/admin/team-members". NOTE: "/admin/member-resets" does NOT start
// with "/admin/members" as a string (they diverge at "s" vs "-"), so it needs its own explicit
// entry rather than relying on the members prefix.
const ADMIN_ROUTE_MODULES = [
  { prefix: "/admin/stats", module: "stats" },
  { prefix: "/admin/how-it-works", module: "howItWorks" },
  { prefix: "/admin/products", module: "products" },
  { prefix: "/admin/portfolio", module: "portfolio" },
  { prefix: "/admin/about", module: "about" },
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

export function isAdminPathEnabled(pathname, states) {
  const match = ADMIN_ROUTE_MODULES.find((r) => pathname.startsWith(r.prefix));
  return match ? isEnabled(match.module, states) : true;
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
// "#contact-info" is deliberately absent: that section's on/off state lives in contact_info.
// enabled (lib/contactInfo.js), not module_settings, so app/page.js checks it directly instead
// of through this map. "#plans" is also absent — it's a static Falcon Web Suite marketing
// section (config/site.js `plans: null`), not part of the module system at all.
const ANCHOR_MODULES = {
  "#about": "about",
  "#how-it-works": "howItWorks",
  "#products": "products",
  "#portfolio": "portfolio",
  "#enquiry": "enquiryForm",
  "#reviews": "reviews",
  "#certifications": "certifications",
};

export function isPublicPathEnabled(path, states) {
  if (path in ANCHOR_MODULES) {
    return isEnabled(ANCHOR_MODULES[path], states);
  }
  const match = PUBLIC_ROUTE_MODULES.find((r) => path.startsWith(r.prefix));
  return match ? isEnabled(match.module, states) : true;
}

// Admin nav item hrefs gated by module, for filtering config/site.js's admin.nav in
// AdminLayout. Keyed the same way as ADMIN_ROUTE_MODULES but as an exact-match lookup since
// nav hrefs are exact, not prefixes.
const NAV_HREF_MODULES = {
  "/admin/stats": "stats",
  "/admin/how-it-works": "howItWorks",
  "/admin/products": "products",
  "/admin/portfolio": "portfolio",
  "/admin/about": "about",
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

export function isNavItemEnabled(href, states) {
  const moduleName = NAV_HREF_MODULES[href];
  return moduleName ? isEnabled(moduleName, states) : true;
}
