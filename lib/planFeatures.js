// Mirrors docs/package-plans.md's "Feature comparison" table — keep both in sync if the
// tier/module mapping changes. Deliberately static (not derived from lib/plan.js's module
// list) since it's meant to read like a sales comparison, not a literal dump of internal
// module names. Shared by the admin "Compare plans" page (no pricing) and the public home
// page "Plans" section (with pricing) so the two never drift apart.
//
// `group` matches the module grouping shown in admin Settings → Feature Config
// (lib/moduleSettings.js MODULE_GROUPS), so a client sees the same categories whether they're
// reading the public comparison page or an admin is toggling features off.
export const FEATURES = [
  { group: "Core", label: "Home page (hero, stats, how it works, about, map)", basic: true, plus: true, premium: true },
  { group: "Core", label: "Contact info block + enquiry form", basic: true, plus: true, premium: true },
  { group: "Core", label: "WhatsApp CTA + social links", basic: true, plus: true, premium: true },
  { group: "Core", label: "Products or Portfolio showcase", basic: true, plus: true, premium: true },
  { group: "Core", label: "Both Products and Portfolio", basic: false, plus: true, premium: true },
  { group: "Core", label: "Basic analytics (visit counter)", basic: true, plus: true, premium: true },
  { group: "Appearance", label: "Full 8-theme switcher + dark mode", basic: false, plus: true, premium: true },
  { group: "Content & Marketing", label: "Blog", basic: false, plus: true, premium: true },
  { group: "Content & Marketing", label: "Gallery", basic: false, plus: true, premium: true },
  { group: "Content & Marketing", label: "News & Events", basic: false, plus: true, premium: true },
  { group: "Content & Marketing", label: "Reviews (third-party ratings) + Partners strip", basic: false, plus: true, premium: true },
  { group: "Content & Marketing", label: "Customer-submitted reviews (moderated)", basic: false, plus: true, premium: true },
  { group: "Content & Marketing", label: "Team & Team Members", basic: false, plus: true, premium: true },
  { group: "Content & Marketing", label: "Certifications", basic: false, plus: true, premium: true },
  { group: "Tools", label: "“Write with AI” content assistant", basic: false, plus: true, premium: true },
  { group: "Booking", label: "Online booking / appointment scheduling", basic: false, plus: true, premium: true },
  { group: "Booking", label: "Booking waitlist for fully-booked dates", basic: false, plus: true, premium: true },
  { group: "Commerce", label: "Shopping cart + checkout + order management", basic: false, plus: false, premium: true },
  { group: "Commerce", label: "Discount / promo codes at checkout", basic: false, plus: false, premium: true },
  { group: "Commerce", label: "Member login portal + order history", basic: false, plus: false, premium: true },
  { group: "Commerce", label: "Membership verification lookup", basic: false, plus: false, premium: true },
  { group: "Commerce", label: "GDPR account closure (member request, admin-reviewed)", basic: false, plus: false, premium: true },
];

// Founding Client pricing — flat rates (not ranges) for the first ~10-15 signups, offered as a
// deliberate launch discount to remove hesitation while there's no track record yet. Once that
// cohort is full, move new clients to the higher STANDARD_TIER_PRICES below by editing each
// tier's setupPrice/monthlyPrice here — the founding rate stays locked for everyone who already
// signed at it (that's the actual incentive to act now rather than wait), so don't change
// existing clients' invoiced amounts when you switch this.
//
// Standard pricing to move to after the founding cohort:
//   Basic:   £325 setup, £22/mo
//   Plus:    £550 setup, £40/mo
//   Premium: £900 setup, £65/mo
export const TIERS = [
  {
    key: "basic",
    label: "Basic",
    setupPrice: "£250",
    monthlyPrice: "£15",
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
    setupPrice: "£400",
    monthlyPrice: "£30",
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
    setupPrice: "£750",
    monthlyPrice: "£50",
    blurb: "For businesses ready to transact online and build repeat customers.",
    highlights: [
      "Everything in Plus, plus:",
      "Shopping cart + checkout",
      "Discount / promo codes",
      "Member login portal + order history",
    ],
  },
];
