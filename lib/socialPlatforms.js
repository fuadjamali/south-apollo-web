// Pure data, no DB import — kept separate from lib/socialSettings.js so client components
// (e.g. components/SocialSettingsForm.js) can use this list without bundling the `pg` driver
// that socialSettings.js pulls in via lib/db.js.
//
// `enabledKey` lets a platform's icon be hidden without losing the URL that's already typed in
// — same "toggle off, keep the data" pattern as every other Feature Config-adjacent switch,
// instead of the only way to hide something being to blank out the field.
export const SOCIAL_PLATFORMS = [
  { key: "x_url", enabledKey: "x_enabled", id: "x", label: "X", icon: "ti-brand-x" },
  { key: "facebook_url", enabledKey: "facebook_enabled", id: "facebook", label: "Facebook", icon: "ti-brand-facebook" },
  { key: "instagram_url", enabledKey: "instagram_enabled", id: "instagram", label: "Instagram", icon: "ti-brand-instagram" },
  { key: "tiktok_url", enabledKey: "tiktok_enabled", id: "tiktok", label: "TikTok", icon: "ti-brand-tiktok" },
  { key: "linkedin_url", enabledKey: "linkedin_enabled", id: "linkedin", label: "LinkedIn", icon: "ti-brand-linkedin" },
  { key: "youtube_url", enabledKey: "youtube_enabled", id: "youtube", label: "YouTube", icon: "ti-brand-youtube" },
];
