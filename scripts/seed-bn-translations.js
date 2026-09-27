// Seeds initial Bangla (bn) translations for the admin-editable interface labels: nav items,
// section headings, site text (cookie banner + 401 page), and the titles of the About / Vision &
// Mission / History / Contact sections, and the site-wide top banner. Matches on the current English
// value and only fills a Bangla field that is still empty, so it never overwrites anything an
// admin has already written — safe to re-run, and safe against production.
//
// Run: node --env-file=.env.local scripts/seed-bn-translations.js
// (for another database: DATABASE_URL=... node scripts/seed-bn-translations.js)
const { Pool } = require("pg");

const NAV = {
  About: "পরিচিতি",
  Explore: "এক্সপ্লোর",
  Company: "প্রতিষ্ঠান",
  Contact: "যোগাযোগ",
  Plans: "প্ল্যান",
  "Book Doctor": "ডাক্তার বুকিং",
  "Book Now": "বুক করুন",
  "About Us": "আমাদের সম্পর্কে",
  "Vision & Mission": "ভিশন ও মিশন",
  History: "ইতিহাস",
  "How It Works": "কীভাবে কাজ করে",
  Products: "পণ্য ও সেবা",
  Portfolio: "আমাদের কাজ",
  Gallery: "গ্যালারি",
  Blog: "ব্লগ",
  "News & Events": "সংবাদ ও ইভেন্ট",
  Team: "আমাদের টিম",
  Reviews: "রিভিউ",
  Certifications: "সনদ ও স্বীকৃতি",
  Membership: "সদস্যপদ",
  "Send an Enquiry": "জিজ্ঞাসা পাঠান",
  "Contact Info": "যোগাযোগের তথ্য",
};

// English heading/subheading text → Bangla. Keyed by text, not section, so a heading an admin
// has already rewritten in English is left alone until they add its Bangla themselves.
const SECTION_TEXT = {
  "From the blog": "ব্লগ থেকে",
  "News, updates, and stories from the team.": "আমাদের টিমের সংবাদ, আপডেট ও গল্প।",
  Certifications: "সনদ ও স্বীকৃতি",
  "Have a question?": "কোনো প্রশ্ন আছে?",
  "Tell us about your business and we'll help you pick the right plan.":
    "আপনার ব্যবসা সম্পর্কে জানান, সঠিক প্ল্যান বেছে নিতে আমরা সাহায্য করব।",
  "Ready to work together?": "একসাথে কাজ শুরু করতে প্রস্তুত?",
  "Reach out and let's get started.": "যোগাযোগ করুন, শুরু করা যাক।",
  Gallery: "গ্যালারি",
  "A look at our recent work.": "আমাদের সাম্প্রতিক কাজের এক ঝলক।",
  "How it works": "কীভাবে কাজ করে",
  "A simple process from start to finish.": "শুরু থেকে শেষ পর্যন্ত একটি সহজ প্রক্রিয়া।",
  "Find us": "আমাদের খুঁজে নিন",
  "News & Events": "সংবাদ ও ইভেন্ট",
  "Company announcements and upcoming events.": "প্রতিষ্ঠানের ঘোষণা ও আসন্ন ইভেন্ট।",
  "Trusted by teams at": "যাদের আস্থা অর্জন করেছি",
  "Our Work": "আমাদের কাজ",
  "A selection of past projects.": "আমাদের আগের কিছু কাজ।",
  "Add-on Services": "অতিরিক্ত সেবা",
  "Optional extras for your new site, on top of any plan.":
    "যেকোনো প্ল্যানের সাথে যুক্ত করা যায় এমন ঐচ্ছিক অতিরিক্ত সেবা।",
  "What people say about us": "আমাদের সম্পর্কে সবাই যা বলেন",
  "Meet our team": "আমাদের টিমের সাথে পরিচিত হোন",
  "The people behind the work.": "যাদের নিষ্ঠায় আমাদের পথচলা।",
};

const SITE_TEXT = {
  "We use minimal analytics (page visits, general location) to understand how visitors use this site. See our privacy practices for details.":
    "এই সাইট কীভাবে ব্যবহার হয় তা বুঝতে আমরা সীমিত পরিসরে বিশ্লেষণ (পেজ ভিজিট, সাধারণ অবস্থান) ব্যবহার করি। বিস্তারিত জানতে আমাদের গোপনীয়তা নীতি দেখুন।",
  Accept: "সম্মতি দিন",
  Decline: "প্রত্যাখ্যান করুন",
  "Error 401": "ত্রুটি 401",
  "Site unavailable": "পেজটি পাওয়া যাচ্ছে না",
  "This page doesn't exist or isn't accessible. Check the link and try again.":
    "এই পেজটি নেই অথবা এতে প্রবেশ করা যাচ্ছে না। লিংকটি যাচাই করে আবার চেষ্টা করুন।",
};
const SITE_TEXT_FIELDS = [
  "cookie_message",
  "cookie_accept_label",
  "cookie_decline_label",
  "unavailable_error_code_label",
  "unavailable_heading",
  "unavailable_message",
];

// Singleton section tables whose title (and, for contact, subheading) is a section label.
const SECTION_TITLE_TEXT = {
  "About Us": "আমাদের সম্পর্কে",
  "Vision & Mission": "ভিশন ও মিশন",
  "Our History": "আমাদের ইতিহাস",
  "Contact Us": "যোগাযোগ করুন",
  "Get in touch with us directly.": "সরাসরি আমাদের সাথে যোগাযোগ করুন।",
  // Root alert (site-wide top banner)
  "This trial web site is under development now.": "এই ট্রায়াল ওয়েবসাইটটি বর্তমানে নির্মাণাধীন।",
  "This is a demo site showcasing South Apollo's features — it does not represent a real business.":
    "এটি South Apollo-এর ফিচারগুলো দেখানোর একটি ডেমো সাইট — এটি কোনো বাস্তব প্রতিষ্ঠানের প্রতিনিধিত্ব করে না।",
};
const SECTION_TITLE_TABLES = {
  about_info: ["heading"],
  vision_mission_info: ["heading"],
  history_info: ["heading"],
  contact_info: ["heading", "subheading"],
  root_alert: ["message"],
};

const isBlank = (v) => typeof v !== "string" || !v.trim();

// Same merge the app's own saves use (lib/i18n/localize.js mergeTranslationSql).
const MERGE_BN = `translations = jsonb_set(COALESCE(translations, '{}'::jsonb), '{bn}',
  COALESCE(translations -> 'bn', '{}'::jsonb) || $1::jsonb)`;

async function ensureColumn(client, table) {
  await client.query(
    `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb`
  );
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  const counts = { nav: 0, sections: 0, siteText: 0, titles: 0 };
  try {
    // Neon's pooled endpoint doesn't apply a default search_path (see lib/db.js).
    await client.query("SET search_path TO public");
    for (const table of ["nav_items", "section_headings", "site_text", ...Object.keys(SECTION_TITLE_TABLES)]) {
      await ensureColumn(client, table);
    }

    const nav = await client.query("SELECT id, label, translations FROM nav_items");
    for (const row of nav.rows) {
      const bn = NAV[row.label];
      if (!bn || !isBlank(row.translations?.bn?.label)) continue;
      await client.query(`UPDATE nav_items SET ${MERGE_BN} WHERE id = $2`, [
        JSON.stringify({ label: bn }),
        row.id,
      ]);
      counts.nav++;
    }

    const sections = await client.query(
      "SELECT section_key, heading, subheading, translations FROM section_headings"
    );
    for (const row of sections.rows) {
      const patch = {};
      if (SECTION_TEXT[row.heading] && isBlank(row.translations?.bn?.heading)) {
        patch.heading = SECTION_TEXT[row.heading];
      }
      if (row.subheading && SECTION_TEXT[row.subheading] && isBlank(row.translations?.bn?.subheading)) {
        patch.subheading = SECTION_TEXT[row.subheading];
      }
      if (!Object.keys(patch).length) continue;
      await client.query(`UPDATE section_headings SET ${MERGE_BN} WHERE section_key = $2`, [
        JSON.stringify(patch),
        row.section_key,
      ]);
      counts.sections++;
    }

    const site = await client.query("SELECT * FROM site_text WHERE id = 1");
    if (site.rows[0]) {
      const row = site.rows[0];
      const patch = {};
      for (const field of SITE_TEXT_FIELDS) {
        if (SITE_TEXT[row[field]] && isBlank(row.translations?.bn?.[field])) {
          patch[field] = SITE_TEXT[row[field]];
        }
      }
      if (Object.keys(patch).length) {
        await client.query(`UPDATE site_text SET ${MERGE_BN} WHERE id = 1`, [JSON.stringify(patch)]);
        counts.siteText = Object.keys(patch).length;
      }
    }

    for (const [table, fields] of Object.entries(SECTION_TITLE_TABLES)) {
      const { rows } = await client.query(`SELECT * FROM ${table} WHERE id = 1`);
      const row = rows[0];
      if (!row) continue;
      const patch = {};
      for (const field of fields) {
        if (SECTION_TITLE_TEXT[row[field]] && isBlank(row.translations?.bn?.[field])) {
          patch[field] = SECTION_TITLE_TEXT[row[field]];
        }
      }
      if (!Object.keys(patch).length) continue;
      await client.query(`UPDATE ${table} SET ${MERGE_BN} WHERE id = 1`, [JSON.stringify(patch)]);
      counts.titles += Object.keys(patch).length;
    }

    console.log(
      `Seeded Bangla: ${counts.nav} nav items, ${counts.sections} section headings, ` +
        `${counts.siteText} site-text fields, ${counts.titles} section titles.`
    );
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
