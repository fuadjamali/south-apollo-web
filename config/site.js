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

  // A plain item is { label, href }. A grouped item is { label, children: [...] } and renders
  // as a dropdown on desktop / an expandable section on mobile — see components/SiteHeader.js.
  // `cta: true` on a plain item styles it as a highlighted pill instead of a text link.
  nav: [
    {
      label: "About",
      children: [
        { label: "About Us", href: "#about" },
        { label: "How It Works", href: "#how-it-works" },
      ],
    },
    {
      label: "Explore",
      children: [
        { label: "Products", href: "#products" },
        { label: "Portfolio", href: "#portfolio" },
        { label: "Gallery", href: "/gallery" },
        { label: "Blog", href: "/blog" },
        { label: "News & Events", href: "/news-events" },
      ],
    },
    {
      label: "Company",
      children: [
        { label: "Team", href: "/team" },
        { label: "Reviews", href: "#reviews" },
        { label: "Certifications", href: "#certifications" },
        { label: "Membership", href: "/membership" },
      ],
    },
    {
      label: "Contact",
      children: [
        { label: "Send an Enquiry", href: "#enquiry" },
        { label: "Contact Info", href: "#contact-info" },
      ],
    },
    { label: "Book Now", href: "/booking", cta: true },
  ],

  hero: {
    heading: "YOUR_HERO_HEADLINE",
    subheading: "A short supporting line that explains the value proposition.",
    primaryCta: { label: "View Products", href: "#products" },
    secondaryCta: { label: "Contact Us", href: "#contact-info" },
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

  // Optional — set to null to remove the section from the home page. The project list itself
  // lives in Postgres (lib/portfolio.js), editable via /admin/portfolio — this just holds the
  // section's static heading/subheading, same pattern as gallery/reviews.
  portfolio: {
    heading: "Our Work",
    subheading: "A selection of past projects.",
  },

  // Optional — set to null to remove the section from the home page and disable /gallery
  // entirely. The photo list itself lives in Postgres (lib/gallery.js), editable via
  // /admin/gallery — this just holds the section's static heading/subheading. Only the 3 most
  // recent photos show on the home page; the full set lives at /gallery, same "recent slice on
  // home, full list on its own page" pattern as Blog and News & Events.
  gallery: {
    heading: "Gallery",
    subheading: "A look at our recent work.",
  },

  // Optional — set to null to remove the section from the home page. The platform list itself
  // now lives in Postgres (lib/reviews.js), editable via /admin/reviews — this just holds the
  // section's static heading, same pattern as products/blog.
  reviews: {
    heading: "What people say about us",
  },

  // Optional — set to null to remove the section from the home page. The certification list
  // itself lives in Postgres (lib/certifications.js), editable via /admin/certifications —
  // this just holds the section's static heading, same pattern as gallery/reviews.
  certifications: {
    heading: "Certifications",
  },

  // Optional — set to null to remove the section from the home page and disable /team
  // entirely. Team/member data lives in Postgres (lib/teams.js / lib/teamMembers.js), editable
  // via /admin/team and /admin/team-members — this just holds the shared heading/subheading
  // used by both the home page section and the /team page. The home section only shows teams
  // and members with "Show on home" enabled (and active members); /team shows every active
  // member regardless of that flag.
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
          { label: "Gallery", href: "/admin/gallery" },
          { label: "Blog", href: "/admin/blog" },
          { label: "News & Events", href: "/admin/news-events" },
          { label: "Reviews (Platforms)", href: "/admin/reviews" },
          { label: "Reviews (Customer)", href: "/admin/testimonials" },
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
          { label: "Member Password Resets", href: "/admin/member-resets" },
          { label: "Account Closure Requests", href: "/admin/account-closures" },
          { label: "Partners", href: "/admin/partners" },
        ],
      },
      {
        label: "Booking",
        children: [
          { label: "Booking Services", href: "/admin/booking-services" },
          { label: "Availability", href: "/admin/availability" },
          { label: "Bookings", href: "/admin/bookings" },
          { label: "Booking Waitlist", href: "/admin/booking-waitlist" },
        ],
      },
      {
        label: "Insights",
        children: [
          { label: "Orders", href: "/admin/orders" },
          { label: "Discount Codes", href: "/admin/discount-codes" },
          { label: "Enquiries", href: "/admin/enquiries" },
          { label: "Analytics", href: "/admin/analytics" },
        ],
      },
      { label: "Contact Us", href: "/admin/contact" },
      {
        label: "Settings",
        children: [
          { label: "Account", href: "/admin/account" },
          { label: "Subscription", href: "/admin/subscription" },
          { label: "AI Assistant", href: "/admin/ai-settings" },
        ],
      },
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
