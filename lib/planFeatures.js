// Mirrors docs/package-plans.md's "Feature comparison" table — keep both in sync if the
// tier/module mapping changes. Deliberately static (not derived from lib/plan.js's module
// list) since it's meant to read like a sales comparison, not a literal dump of internal
// module names. Shared by the admin "Compare plans" page (no pricing) and the public home
// page "Plans" section (with pricing) so the two never drift apart.
export const FEATURES = [
  { label: "Home page (hero, stats, how it works, about, map)", basic: true, plus: true, premium: true },
  { label: "Contact info block + enquiry form", basic: true, plus: true, premium: true },
  { label: "WhatsApp CTA + social links", basic: true, plus: true, premium: true },
  { label: "Products or Portfolio showcase", basic: true, plus: true, premium: true },
  { label: "Both Products and Portfolio", basic: false, plus: true, premium: true },
  { label: "Full 8-theme switcher + dark mode", basic: false, plus: true, premium: true },
  { label: "Basic analytics (visit counter)", basic: true, plus: true, premium: true },
  { label: "Blog", basic: false, plus: true, premium: true },
  { label: "Gallery", basic: false, plus: true, premium: true },
  { label: "News & Events", basic: false, plus: true, premium: true },
  { label: "Reviews (third-party ratings) + Partners strip", basic: false, plus: true, premium: true },
  { label: "Customer-submitted reviews (moderated)", basic: false, plus: true, premium: true },
  { label: "Team & Team Members", basic: false, plus: true, premium: true },
  { label: "Certifications", basic: false, plus: true, premium: true },
  { label: "“Write with AI” content assistant", basic: false, plus: true, premium: true },
  { label: "Online booking / appointment scheduling", basic: false, plus: true, premium: true },
  { label: "Booking waitlist for fully-booked dates", basic: false, plus: true, premium: true },
  { label: "Shopping cart + checkout + order management", basic: false, plus: false, premium: true },
  { label: "Discount / promo codes at checkout", basic: false, plus: false, premium: true },
  { label: "Member login portal + order history", basic: false, plus: false, premium: true },
  { label: "Membership verification lookup", basic: false, plus: false, premium: true },
];

export const TIERS = [
  {
    key: "basic",
    label: "Basic",
    setupPrice: "£270–£315",
    monthlyPrice: "£17–£23",
    blurb: "A credible online presence — what you do, how to reach you.",
    highlights: [
      "Home page + one showcase (Products or Portfolio)",
      "Contact info + enquiry form",
      "WhatsApp CTA + social links",
      "Basic visit analytics",
    ],
  },
  {
    key: "plus",
    label: "Plus",
    setupPrice: "£450–£540",
    monthlyPrice: "£32–£41",
    blurb: "For businesses actively marketing themselves and taking bookings.",
    popular: true,
    highlights: [
      "Everything in Basic, plus:",
      "Blog, Gallery, News & Events",
      "Reviews, Team, Certifications",
      "Real-time booking + waitlist",
      "“Write with AI” content assistant",
    ],
  },
  {
    key: "premium",
    label: "Premium",
    setupPrice: "£675–£810",
    monthlyPrice: "£50–£68",
    blurb: "For businesses ready to transact online and build repeat customers.",
    highlights: [
      "Everything in Plus, plus:",
      "Shopping cart + checkout",
      "Discount / promo codes",
      "Member login portal + order history",
    ],
  },
];
