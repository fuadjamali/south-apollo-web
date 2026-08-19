const siteConfig = {
  // The banner shown at the very top of every page ("Root Alert") is admin-editable at
  // /admin/root-alert (lib/rootAlert.js) — no config here. Defaults on with Falcon Web
  // Suite's own demo disclaimer text; turn it off or reword it for a real client deployment.

  // Business name/tagline/description/domain are admin-editable at /admin/business
  // (lib/businessInfo.js) — no config here. Address is contact_info.address
  // (lib/contactInfo.js, editable at /admin/contact) — the same value shown in the Contact Us
  // section and the map embed, rather than a separate copy of its own.

  // Cookie consent banner text and the 401 "Site Unavailable" page text are admin-editable at
  // /admin/site-text (lib/siteText.js) — no config here for either.

  // The header nav menu is admin-editable at /admin/nav (lib/navItems.js) — no config here.

  // Hero heading/subheading/background image/buttons are admin-editable at /admin/hero
  // (lib/heroInfo.js) — no config here. Whether the section shows at all is controlled by the
  // "hero" toggle in Settings → Feature Config, same as every other Core section.

  // The stat list itself lives in Postgres (lib/stats.js), editable via /admin/stats — that
  // section has no heading of its own, just an on/off toggle in Settings → Feature Config.
  //
  // How It Works, Portfolio, Gallery, Reviews, Certifications, Team, Blog, News & Events,
  // Enquiry Form, Find Us (map), and Partners (the "Trusted by" strip — only partners with
  // status "Active" are shown) headings/subheadings are admin-editable at /admin/section-text
  // (lib/sectionHeadings.js) — no config here. Whether each section shows at all is still
  // controlled from Settings → Feature Config, same as before.

  // The product list itself lives in Postgres (lib/products.js), editable via /admin/products.
  // Its section heading/subheading is admin-editable at /admin/section-text
  // (lib/sectionHeadings.js) — no config here for either.

  // Optional — set to null to remove the section from the home page. Static (not admin-
  // editable) since it's the site's own pricing tiers, defined in lib/planFeatures.js — only
  // meaningful for Falcon Web Suite's own marketing site. A deployed client site has no
  // reason to show its own Basic/Plus/Premium tiers to its visitors, so leave this `null` for
  // every client deployment.
  plans: {
    heading: "Plans that grow with you",
    subheading:
      "Founding client pricing for our first clients — locked in for as long as you stay with us. Start on Basic, upgrade to Plus or Premium whenever you're ready — no rebuild.",
  },

  // Footer heading/subheading is admin-editable at /admin/section-text (lib/sectionHeadings.js).
  // WhatsApp number/messages and the social icon row are admin-editable at /admin/social
  // (lib/socialSettings.js) — no config here for either.

  // The admin panel's own login/dashboard text is admin-editable at /admin/admin-text
  // (lib/adminText.js), and its sidebar menu structure at /admin/admin-nav
  // (lib/adminNavItems.js) — no config here for either.
};

export default siteConfig;
