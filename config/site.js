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
    { label: "Blog", href: "/blog" },
    { label: "Enquiry", href: "#enquiry" },
    { label: "Contact", href: "#contact" },
  ],

  hero: {
    heading: "YOUR_HERO_HEADLINE",
    subheading: "A short supporting line that explains the value proposition.",
    primaryCta: { label: "View Products", href: "#products" },
    secondaryCta: { label: "Contact Us", href: "#contact" },
  },

  // Optional — set to null to remove the section from the home page.
  stats: {
    items: [
      { value: "500+", label: "STAT_1_LABEL" },
      { value: "10", label: "STAT_2_LABEL" },
      { value: "50+", label: "STAT_3_LABEL" },
      { value: "98%", label: "STAT_4_LABEL" },
    ],
  },

  // Optional — set to null to remove the section from the home page.
  trustedBy: {
    heading: "Trusted by teams at",
    logos: [
      { id: 1, name: "CUSTOMER_1_NAME" },
      { id: 2, name: "CUSTOMER_2_NAME" },
      { id: 3, name: "CUSTOMER_3_NAME" },
      { id: 4, name: "CUSTOMER_4_NAME" },
      { id: 5, name: "CUSTOMER_5_NAME" },
    ],
  },

  // Optional — set to null to remove the section from the home page.
  howItWorks: {
    heading: "How it works",
    subheading: "A simple process from start to finish.",
    steps: [
      { title: "STEP_1_TITLE", description: "STEP_1_DESCRIPTION" },
      { title: "STEP_2_TITLE", description: "STEP_2_DESCRIPTION" },
      { title: "STEP_3_TITLE", description: "STEP_3_DESCRIPTION" },
    ],
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

  // Optional — set to null to remove the section from the home page.
  reviews: {
    heading: "What people say about us",
    platforms: [
      { id: "trustpilot", name: "Trustpilot", rating: "4.8", count: "0 reviews", url: "https://www.trustpilot.com/review/YOUR_DOMAIN", logo: "/logos/trustpilot.svg" },
      { id: "google", name: "Google", rating: "4.9", count: "0 reviews", url: "https://g.page/r/YOUR_GOOGLE_PLACE_ID/review", logo: "/logos/google.svg" },
      { id: "clutch", name: "Clutch", rating: "5.0", count: "0 reviews", url: "https://clutch.co/profile/YOUR_PROFILE" },
    ],
  },

  about: {
    heading: "About Us",
    body: "ABOUT_BODY",
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
    nav: [
      { label: "Home", href: "/admin" },
      { label: "Trusted By", href: "/admin/trusted-by" },
      { label: "Products", href: "/admin/products" },
      { label: "Portfolio", href: "/admin/portfolio" },
      { label: "Reviews", href: "/admin/reviews" },
      { label: "About", href: "/admin/about" },
      { label: "Certifications", href: "/admin/certifications" },
      { label: "Contact Us", href: "/admin/contact" },
      { label: "Enquiries", href: "/admin/enquiries" },
      { label: "Analytics", href: "/admin/analytics" },
      { label: "Blog", href: "/admin/blog" },
    ],
  },

  // Optional — set to null to remove Blog from the nav and disable /blog entirely.
  // The post list itself now lives in Postgres (lib/blog.js), editable via /admin/blog —
  // this just holds the section's static heading/subheading, same pattern as products.
  blog: {
    heading: "From the blog",
    subheading: "News, updates, and stories from the team.",
  },

  siteUnavailable: {
    errorCodeLabel: "Error 401",
    heading: "Site unavailable",
    message: "This page doesn't exist or isn't accessible. Check the link and try again.",
  },
};

export default siteConfig;
