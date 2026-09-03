// Shared by every section that can show text on top of a full-bleed background image (hero,
// about) — the overlay/text-style *choices* an admin picks from (validated against in
// lib/heroInfo.js and lib/aboutInfo.js) and the CSS they actually render as (used directly by
// app/page.js). One shared source so hero and about can never quietly drift into rendering the
// same "medium" or "light" differently from each other.
export const OVERLAY_STRENGTHS = ["light", "medium", "dark"];
export const TEXT_STYLES = ["auto", "light", "dark"];

// overlay_strength controls how strong the theme-color scrim over the background image is;
// text_style lets the admin force light or dark text when the theme-based overlay alone isn't
// enough contrast for a particular image, without ever hardcoding a raw color that could break
// in one of the site's other 7 themes or dark mode. Tailwind needs to see each class name as a
// complete literal token, not built from a template string, hence the explicit map rather than
// `bg-background/${n}`.
export const OVERLAY_OPACITY_CLASSES = {
  light: "bg-background/10",
  medium: "bg-background/25",
  dark: "bg-background/45",
};

export const TEXT_STYLE_CLASSES = {
  auto: { heading: "", subheading: "text-muted", secondaryBtn: "border-border hover:bg-surface-alt" },
  light: {
    heading: "text-white",
    subheading: "text-white/85",
    secondaryBtn: "border-white/40 text-white hover:bg-white/10",
  },
  dark: {
    heading: "text-gray-900",
    subheading: "text-gray-700",
    secondaryBtn: "border-gray-900/30 text-gray-900 hover:bg-gray-900/5",
  },
};
