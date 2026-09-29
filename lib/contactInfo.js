import { db } from "@/lib/db";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { localizeFields, mergeTranslationSql } from "@/lib/i18n/localize";

async function ensureTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS contact_info (
        id SERIAL PRIMARY KEY,
        heading VARCHAR(255) NOT NULL DEFAULT 'Contact Us',
        subheading TEXT,
        address TEXT,
        phone VARCHAR(50),
        email VARCHAR(255),
        enabled BOOLEAN NOT NULL DEFAULT true,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    // See lib/sectionHeadings.js's ensureTable comment — concurrent first-time
    // "CREATE TABLE IF NOT EXISTS" callers can race under Postgres.
    if (err.code !== "23505" && err.code !== "42P07") throw err;
  }
  // Section title in other languages, { bn: { heading, subheading } } — lib/i18n/localize.js.
  await db.query(
    `ALTER TABLE contact_info ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb`
  );
  // One phone per line, optionally labelled ("Hotline: 09617-888892", "Mobile: 01711-457444,
  // 01706-354974") — a clinic has a hotline, a landline and several mobiles, which the original
  // single VARCHAR(50) couldn't hold. Widening an existing column is a no-op once it's TEXT.
  await db.query("ALTER TABLE contact_info ALTER COLUMN phone TYPE TEXT");
}

// Singleton, always row id=1 — seeded via an explicit id (not the SERIAL default) with
// ON CONFLICT DO NOTHING, atomic under concurrent requests. See lib/businessInfo.js's
// ensureRow comment for why ("SELECT COUNT then INSERT if empty" is racy and duplicated
// business_info for real during ordinary concurrent page loads).
async function ensureRow() {
  await db.query(
    `INSERT INTO contact_info (id, heading, subheading, address, phone, email, enabled)
     VALUES (1, $1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO NOTHING`,
    [
      "Contact Us",
      "Get in touch with us directly.",
      "YOUR_BUSINESS_ADDRESS",
      "YOUR_PHONE_NUMBER",
      "hello@example.com",
      true,
    ]
  );
}

// `locale` swaps in that language's heading/subheading/address where set (English otherwise).
// `address_en` always carries the English address — the map embed and the search-engine
// LocalBusiness data use it whatever the page language, since that's what geocodes reliably.
export async function getContactInfo(locale = DEFAULT_LOCALE) {
  await ensureTable();
  await ensureRow();
  const { rows } = await db.query("SELECT * FROM contact_info WHERE id = 1");
  return {
    ...localizeFields(rows[0], locale, ["heading", "subheading", "address"]),
    address_en: rows[0]?.address || null,
  };
}

// "Hotline: 09617-888892\nMobile: 01711-457444, 01706-354974" -> [{ label, numbers }]. A line
// without a "Label:" prefix is just numbers. Numbers are split on commas and slashes.
export function parsePhoneLines(text) {
  return (text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^([^:\d+]{2,30}):\s*(.+)$/);
      const label = m ? m[1].trim() : null;
      const numbers = (m ? m[2] : line)
        .split(/[,/]/)
        .map((n) => n.trim())
        .filter(Boolean);
      return { label, numbers };
    })
    .filter((l) => l.numbers.length);
}

// The single best number for a "call us now" button (the floating hotline call icon) — the
// first number on whichever line is labeled Hotline, or just the very first number if none is,
// so the button still works for a business that only ever wrote plain numbers with no labels.
export function primaryPhoneNumber(phone) {
  const lines = parsePhoneLines(phone);
  const hotline = lines.find((l) => l.label?.toLowerCase().replace(/[^a-z]/g, "") === "hotline");
  return (hotline || lines[0])?.numbers[0] || null;
}

// Quick on/off switch for Settings → Feature Config, without needing the full form payload
// updateContactInfo requires — leaves heading/subheading/address/phone/email untouched.
export async function setContactInfoEnabled(enabled) {
  await ensureTable();
  await ensureRow();
  await db.query("UPDATE contact_info SET enabled = $1, updated_at = now() WHERE id = 1", [
    enabled,
  ]);
}

export async function updateContactInfo({
  heading,
  subheading,
  address,
  phone,
  email,
  enabled,
  bn = {},
}) {
  await ensureTable();
  await ensureRow();
  await db.query(
    `UPDATE contact_info
     SET heading = $1, subheading = $2, address = $3, phone = $4, email = $5, enabled = $6,
         ${mergeTranslationSql("$7", "$8")}, updated_at = now()
     WHERE id = 1`,
    [
      heading,
      subheading || null,
      address || null,
      phone || null,
      email || null,
      enabled,
      "bn",
      JSON.stringify({ heading: bn.heading || "", subheading: bn.subheading || "", address: bn.address || "" }),
    ]
  );
}

// Common phone labels (see parsePhoneLines above) in the page's language — used by Contact Us
// and the branch cards; any other label shows as the admin typed it.
const PHONE_LABEL_KEYS = {
  hotline: "contact.hotline",
  tel: "contact.tel",
  telephone: "contact.tel",
  phone: "contact.tel",
  landline: "contact.tel",
  mobile: "contact.mobile",
  cell: "contact.mobile",
};
export function phoneLabel(label, t) {
  const key = PHONE_LABEL_KEYS[label.toLowerCase().replace(/[^a-z]/g, "")];
  return key ? t(key) : label;
}
