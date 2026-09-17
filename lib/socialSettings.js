import { db } from "@/lib/db";
import { SOCIAL_PLATFORMS } from "@/lib/socialPlatforms";

export { SOCIAL_PLATFORMS };

async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS social_settings (
        id SERIAL PRIMARY KEY,
        whatsapp_number VARCHAR(30),
        whatsapp_message TEXT,
        footer_whatsapp_message TEXT,
        x_url VARCHAR(500),
        facebook_url VARCHAR(500),
        instagram_url VARCHAR(500),
        tiktok_url VARCHAR(500),
        linkedin_url VARCHAR(500),
        youtube_url VARCHAR(500),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    // See lib/sectionHeadings.js's ensureTable comment — concurrent first-time
    // "CREATE TABLE IF NOT EXISTS" callers can race under Postgres.
    if (err.code !== "23505" && err.code !== "42P07") throw err;
  }
  // Added after the table already shipped — ALTER ... ADD COLUMN IF NOT EXISTS instead of
  // folding into CREATE TABLE, so deployments that already have this table pick these up
  // without a manual migration. Default true: an existing platform with a URL already saved
  // keeps showing exactly as before this toggle existed.
  for (const platform of SOCIAL_PLATFORMS) {
    await db.query(
      `ALTER TABLE social_settings ADD COLUMN IF NOT EXISTS ${platform.enabledKey} BOOLEAN NOT NULL DEFAULT true`
    );
  }
  // Group invite link — takes priority over whatsapp_number when set (see getWhatsappHref()
  // below). Nullable, no default, so an existing deployment's one-to-one number keeps working
  // exactly as before until an admin deliberately fills this in.
  await db.query(`ALTER TABLE social_settings ADD COLUMN IF NOT EXISTS whatsapp_group_url VARCHAR(500)`);
}

// Singleton, always row id=1 — seeded via an explicit id (not the SERIAL default) with
// ON CONFLICT DO NOTHING, atomic under concurrent requests. See lib/businessInfo.js's
// ensureRow comment for why ("SELECT COUNT then INSERT if empty" is racy and duplicated
// business_info for real during ordinary concurrent page loads). Seeded from this deployment's
// real values (not placeholders) since this table replaces what used to be hardcoded in
// config/site.js's `contact.whatsappNumber/whatsappMessage` and `social` array.
async function ensureRow() {
  await db.query(
    `INSERT INTO social_settings
       (id, whatsapp_number, whatsapp_message, footer_whatsapp_message,
        x_url, facebook_url, instagram_url, tiktok_url, linkedin_url, youtube_url)
     VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (id) DO NOTHING`,
    [
      "447488382205",
      "Hi, I'd like to get in touch",
      "Hi, I just saw your website and I'd like to get in touch.",
      "https://x.com/YOUR_HANDLE",
      "https://facebook.com/YOUR_PAGE",
      "https://instagram.com/YOUR_HANDLE",
      "https://tiktok.com/@YOUR_HANDLE",
      "https://linkedin.com/company/YOUR_PAGE",
      "https://youtube.com/@YOUR_HANDLE",
    ]
  );
}

export async function getSocialSettings() {
  await ensureTable();
  await ensureRow();
  const { rows } = await db.query("SELECT * FROM social_settings WHERE id = 1");
  return rows[0];
}

// socialUrls/socialEnabled are keyed by SOCIAL_PLATFORMS' key/enabledKey (e.g. "x_url",
// "x_enabled") so this stays correct if a platform is ever added or removed from that list.
export async function updateSocialSettings({
  whatsappNumber,
  whatsappMessage,
  footerWhatsappMessage,
  whatsappGroupUrl,
  socialUrls,
  socialEnabled,
}) {
  await ensureTable();
  await ensureRow();

  const setClauses = [
    "whatsapp_number = $1",
    "whatsapp_message = $2",
    "footer_whatsapp_message = $3",
    "whatsapp_group_url = $4",
  ];
  const values = [
    whatsappNumber || null,
    whatsappMessage || null,
    footerWhatsappMessage || null,
    whatsappGroupUrl || null,
  ];

  for (const platform of SOCIAL_PLATFORMS) {
    values.push(socialUrls[platform.key] || null);
    setClauses.push(`${platform.key} = $${values.length}`);
    values.push(socialEnabled[platform.enabledKey] !== false);
    setClauses.push(`${platform.enabledKey} = $${values.length}`);
  }
  setClauses.push("updated_at = now()");

  await db.query(
    `UPDATE social_settings SET ${setClauses.join(", ")} WHERE id = 1`,
    values
  );
}

// The href every "Chat on WhatsApp" button uses — one place so the three call sites (the home
// page's sidebar card, its footer CTA, and components/FloatingWhatsApp.js) can never drift out
// of sync. A group invite link takes priority when set — group links are already a complete
// destination, they don't take a prefilled-message query string the way a one-to-one wa.me link
// does. Falls back to the existing one-to-one wa.me/<number>?text=<message> link when no group
// link is set. Returns null when neither is configured, so callers can hide the button entirely.
// `fallbackMessage` is a parameter rather than baked in since two of the three call sites want a
// different prefilled message (the floating button's own vs. the footer's).
export function getWhatsappHref(settings, fallbackMessage) {
  if (settings.whatsapp_group_url) return settings.whatsapp_group_url;
  if (!settings.whatsapp_number) return null;
  const message = fallbackMessage ?? settings.whatsapp_message ?? "";
  return `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`;
}

// Public "row of icons" list — only platforms with a URL set AND their toggle on, same shape
// SocialLinks.js already expects ({ id, label, icon, url }).
export function getActiveSocialLinks(settings) {
  return SOCIAL_PLATFORMS.filter((p) => settings[p.key] && settings[p.enabledKey]).map((p) => ({
    id: p.id,
    label: p.label,
    icon: p.icon,
    url: settings[p.key],
  }));
}
