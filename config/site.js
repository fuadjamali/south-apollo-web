const siteConfig = {
  business: {
    name: "YOUR_BUSINESS_NAME",
    tagline: "YOUR_TAGLINE_HERE",
    description:
      "One or two sentences describing what the business does and who it's for.",
    address: "YOUR_BUSINESS_ADDRESS",
    domain: "YOUR_DOMAIN",
  },

  cookieConsent: {
    message:
      "We use minimal analytics (page visits, general location) to understand how visitors use this site. See our privacy practices for details.",
    acceptLabel: "Accept",
    declineLabel: "Decline",
  },

  contact: {
    email: "hello@example.com",
    whatsappNumber: "10000000000",
    whatsappMessage: "Hi, I'd like to get in touch",
  },

  nav: [
    { label: "Products", href: "#products" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "Reviews", href: "#reviews" },
    { label: "About", href: "#about" },
    { label: "Team", href: "#team" },
    { label: "Blog", href: "/blog" },
    { label: "News & Events", href: "/news-events" },
    { label: "Membership", href: "/membership" },
    { label: "Enquiry", href: "#enquiry" },
    { label: "Contact", href: "#contact" },
  ],

  hero: {
    heading: "YOUR_HERO_HEADLINE",
    subheading: "A short supporting line that explains the value proposition.",
    primaryCta: { label: "View Products", href: "#products" },
    secondaryCta: { label: "Contact Us", href: "#contact" },
  },

  // Optional — set to null to remove the section from the home page. The stat list itself
  // now lives in Postgres (lib/stats.js), editable via /admin/stats — this key just flags
  // the section as enabled (it has no static heading of its own).
  stats: true,

  // Optional — set to null to remove the section from the home page. The partner list itself
  // now lives in Postgres (lib/partners.js), editable via /admin/partners — this just holds
  // the section's static heading, same pattern as products/blog/reviews/team. Only partners
  // with status "Active" are shown.
  partners: {
    heading: "Trusted by teams at",
  },

  // Optional — set to null to remove the section from the home page. The step list itself
  // now lives in Postgres (lib/howItWorks.js), editable via /admin/how-it-works — this just
  // holds the section's static heading/subheading, same pattern as products/blog/reviews.
  howItWorks: {
    heading: "How it works",
    subheading: "A simple process from start to finish.",
  },

  // The product list itself now lives in Postgres (lib/products.js), editable via
  // /admin/products — this just holds the section's static heading/subheading.
  products: {
    heading: "Our Products",
    subheading: "A few things we're proud of.",
  },

  // Optional — set to null to remove the section from the home page.
  portfolio: {
    heading: "Our Work",
    subheading: "A selection of past projects.",
    items: [
      { id: 1, image: "/images/portfolio-1.jpg" },
      { id: 2, image: "/images/portfolio-2.jpg" },
      { id: 3, image: "/images/portfolio-3.jpg" },
    ],
  },

  // Optional — set to null to remove the section from the home page. The platform list itself
  // now lives in Postgres (lib/reviews.js), editable via /admin/reviews — this just holds the
  // section's static heading, same pattern as products/blog.
  reviews: {
    heading: "What people say about us",
  },

  // Optional — set to null to remove the section from the home page.
  certifications: {
    heading: "Certifications",
    items: [
      { id: 1, name: "CERTIFICATION_1_NAME" },
      { id: 2, name: "CERTIFICATION_2_NAME" },
      { id: 3, name: "CERTIFICATION_3_NAME" },
    ],
  },

  // Optional — set to null to remove the section from the home page. Team/member data lives
  // in Postgres (lib/teams.js / lib/teamMembers.js), editable via /admin/team and
  // /admin/team-members — this just holds the section's static heading/subheading, same
  // pattern as products/blog/reviews. Only active members are shown, grouped by team.
  team: {
    heading: "Meet our team",
    subheading: "The people behind the work.",
  },

  // Optional — set to null to remove the section from the home page. Live-queries Google Maps with `business.address`.
  map: {
    heading: "Find us",
  },

  // Optional — set to null to remove the section from the home page.
  enquiryForm: {
    heading: "ENQUIRY_HEADING",
    subheading: "ENQUIRY_SUBHEADING",
  },

  footer: {
    heading: "Ready to work together?",
    subheading: "Reach out and let's get started.",
    // Distinct from contact.whatsappMessage (used by the floating button) — each WhatsApp CTA
    // gets a message matching its context instead of one generic message everywhere.
    whatsappMessage: "Hi, I just saw your website and I'd like to get in touch.",
  },

  // Optional — delete entries for platforms you don't use.
  social: [
    { id: "x", label: "X", icon: "ti-brand-x", url: "https://x.com/YOUR_HANDLE" },
    { id: "facebook", label: "Facebook", icon: "ti-brand-facebook", url: "https://facebook.com/YOUR_PAGE" },
    { id: "instagram", label: "Instagram", icon: "ti-brand-instagram", url: "https://instagram.com/YOUR_HANDLE" },
    { id: "tiktok", label: "TikTok", icon: "ti-brand-tiktok", url: "https://tiktok.com/@YOUR_HANDLE" },
    { id: "linkedin", label: "LinkedIn", icon: "ti-brand-linkedin", url: "https://linkedin.com/company/YOUR_PAGE" },
    { id: "youtube", label: "YouTube", icon: "ti-brand-youtube", url: "https://youtube.com/@YOUR_HANDLE" },
  ],

  admin: {
    loginHeading: "Admin login",
    loginSubheading: "Sign in to manage your site.",
    dashboardHeading: "Dashboard",
    dashboardSubheading: "You're signed in as an admin.",
    // A plain item is { label, href }. A grouped item is { label, children: [...] } and
    // renders as a dropdown on desktop / a labeled sub-list on mobile — see
    // app/admin/(protected)/layout.js. Keep "Home" first: AdminLayout underlines index 0
    // as the active/root nav item.
    nav: [
      { label: "Home", href: "/admin" },
      {
        label: "Content",
        children: [
          { label: "Stats", href: "/admin/stats" },
          { label: "How It Works", href: "/admin/how-it-works" },
          { label: "Products", href: "/admin/products" },
          { label: "Portfolio", href: "/admin/portfolio" },
          { label: "Blog", href: "/admin/blog" },
          { label: "News & Events", href: "/admin/news-events" },
          { label: "Reviews", href: "/admin/reviews" },
          { label: "About", href: "/admin/about" },
          { label: "Certifications", href: "/admin/certifications" },
        ],
      },
      {
        label: "People",
        children: [
          { label: "Team", href: "/admin/team" },
          { label: "Team Members", href: "/admin/team-members" },
          { label: "Members", href: "/admin/members" },
          { label: "Partners", href: "/admin/partners" },
        ],
      },
      {
        label: "Insights",
        children: [
          { label: "Enquiries", href: "/admin/enquiries" },
          { label: "Analytics", href: "/admin/analytics" },
        ],
      },
      { label: "Contact Us", href: "/admin/contact" },
      { label: "Account", href: "/admin/account" },
    ],
  },

  // Optional — set to null to remove Blog from the nav and disable /blog entirely.
  // The post list itself now lives in Postgres (lib/blog.js), editable via /admin/blog —
  // this just holds the section's static heading/subheading, same pattern as products.
  blog: {
    heading: "From the blog",
    subheading: "News, updates, and stories from the team.",
  },

  // Optional — set to null to remove News & Events from the nav and disable /news-events
  // entirely. The item list itself lives in Postgres (lib/newsEvents.js), editable via
  // /admin/news-events — this just holds the section's static heading/subheading.
  newsEvents: {
    heading: "News & Events",
    subheading: "Company announcements and upcoming events.",
  },

  siteUnavailable: {
    errorCodeLabel: "Error 401",
    heading: "Site unavailable",
    message: "This page doesn't exist or isn't accessible. Check the link and try again.",
  },
};

export default siteConfig;
