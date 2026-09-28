// Known internal destinations for the Site Navigation editor (/admin/nav) — used to build a
// picker instead of freeform href text entry. The whole point: a typo in a hand-typed href
// (`#produtcs`, `/gallry`) previously saved silently and just... didn't go anywhere, with no
// indication anywhere that anything was wrong. Picking from this list makes that class of
// mistake impossible for anything it covers; `module` (null = always available, no gate) lets
// the admin page show a live "currently hidden" badge next to any item whose target module is
// switched off, so a link that's technically correct but points at something invisible right
// now is visible too — not just silently missing on the live site.
//
// Anchor hrefs and their module mapping mirror lib/plan.js's ANCHOR_MODULES plus a few more
// (#gallery, #recent-posts, #news-events, #team, #contact) that page isn't gated on directly
// but do correspond to a real module for badge purposes here.
export const PAGE_DESTINATIONS = [
  { href: "/", label: "Home", module: null },
  { href: "/gallery", label: "Gallery (full page)", module: "gallery" },
  { href: "/blog", label: "Blog (full page)", module: "blog" },
  { href: "/news-events", label: "News & Events (full page)", module: "newsEvents" },
  { href: "/team", label: "Team (full page)", module: "team" },
  { href: "/booking", label: "Booking", module: "booking" },
  { href: "/health-checkup", label: "Health Check-up Packages", module: "healthPackages" },
  { href: "/doctors", label: "Find a Doctor (directory)", module: "doctors" },
  { href: "/compare-plans", label: "Compare Plans", module: null },
  { href: "/cart", label: "Cart", module: "cart" },
  { href: "/leave-a-review", label: "Leave a Review", module: "reviews" },
  { href: "/privacy-policy", label: "Privacy Policy", module: null },
  { href: "/terms-of-service", label: "Terms of Service", module: null },
];

export const ANCHOR_DESTINATIONS = [
  { href: "#about", label: "About Us (section)", module: "about" },
  { href: "#vision-mission", label: "Vision & Mission (section)", module: "visionMission" },
  { href: "#history", label: "History (section)", module: "history" },
  { href: "#how-it-works", label: "How It Works (section)", module: "howItWorks" },
  { href: "#products", label: "Products (section)", module: "products" },
  { href: "#portfolio", label: "Portfolio (section)", module: "portfolio" },
  { href: "#gallery", label: "Gallery (section)", module: "gallery" },
  { href: "#reviews", label: "Reviews (section)", module: "reviews" },
  { href: "#certifications", label: "Certifications (section)", module: "certifications" },
  { href: "#recent-posts", label: "Blog (section)", module: "blog" },
  { href: "#news-events", label: "News & Events (section)", module: "newsEvents" },
  { href: "#team", label: "Team (section)", module: "team" },
  { href: "#plans", label: "Plans (South Apollo's own — not on client sites)", module: null },
  { href: "#branches", label: "Our Branches (section)", module: "branches" },
  { href: "#contact-info", label: "Contact Info (section)", module: null },
  { href: "#enquiry", label: "Send an Enquiry (section)", module: "enquiryForm" },
  { href: "#contact", label: "Footer / Contact", module: null },
];

export const ALL_DESTINATIONS = [...PAGE_DESTINATIONS, ...ANCHOR_DESTINATIONS];

export function findDestination(href) {
  return ALL_DESTINATIONS.find((d) => d.href === href) || null;
}
