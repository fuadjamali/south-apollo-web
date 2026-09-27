// Seeds initial Bangla (bn) translations for the admin-editable interface labels: nav items,
// section headings, hero slides, site text (cookie banner + 401 page), and the titles of the About / Vision &
// Mission / History / Contact sections, and the site-wide top banner. Matches on the current English
// value and only fills a Bangla field that is still empty, so it never overwrites anything an
// admin has already written — safe to re-run, and safe against production.
//
// Run: node --env-file=.env.local scripts/seed-bn-translations.js
// (for another database: DATABASE_URL=... node scripts/seed-bn-translations.js)
const { Pool } = require("pg");
const SECTION_BODIES = require("./lib/section-bodies-bn");

const NAV = {
  About: "পরিচিতি",
  Explore: "এক্সপ্লোর",
  Company: "প্রতিষ্ঠান",
  Contact: "যোগাযোগ",
  Plans: "প্ল্যান",
  "Book Doctor": "ডাক্তার বুকিং",
  "Find Doctor": "ডাক্তার খুঁজুন",
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
  "Vision & Future Plans": "ভিশন ও ভবিষ্যৎ পরিকল্পনা",
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

// Hero slide text (heading, subheading and button labels) → Bangla, keyed by the exact English
// text so a slide an admin has since rewritten is left for them to translate.
const HERO_TEXT = {
  // Headings
  "Find Your Perfect Doctor, Book Instantly.": "আপনার জন্য সঠিক ডাক্তার খুঁজুন, এখনই বুক করুন।",
  "Find the Right Doctor by Symptom & Book Appointments Instantly": "উপসর্গ দেখে সঠিক ডাক্তার খুঁজুন, এখনই অ্যাপয়েন্টমেন্ট নিন",
  "25 Years of Trust, Leading Tomorrow’s Healthcare": "25 বছরের আস্থা, আগামীর স্বাস্থ্যসেবায় নেতৃত্ব",
  "Your Trusted Healthcare Partner for Life": "সারাজীবনের বিশ্বস্ত স্বাস্থ্যসেবা সঙ্গী",
  "Shaping the Next Era of Healthcare in Southern Bangladesh": "দক্ষিণাঞ্চলের স্বাস্থ্যসেবায় নতুন যুগের সূচনা",
  "A Brand New Look & Upgraded Excellence are Coming Your Way!": "নতুন রূপে, আরও উন্নত সেবা নিয়ে আসছি আমরা!",
  "Today: a website. Tomorrow: a business platform.": "আজ একটি ওয়েবসাইট। আগামীকাল একটি ব্যবসায়িক প্ল্যাটফর্ম।",
  // Subheadings
  "Search specialized doctors, view real-time schedules, and confirm your appointment with just a few simple clicks.":
    "বিশেষজ্ঞ ডাক্তার খুঁজুন, রোগী দেখার সময়সূচি দেখুন এবং মাত্র কয়েকটি ক্লিকে অ্যাপয়েন্টমেন্ট নিশ্চিত করুন।",
  "Search for specialized physicians based on your specific health concerns, view open schedules, and secure your appointment in just a few clicks.":
    "আপনার স্বাস্থ্য সমস্যা অনুযায়ী বিশেষজ্ঞ চিকিৎসক খুঁজুন, রোগী দেখার সময়সূচি দেখুন এবং মাত্র কয়েকটি ক্লিকে অ্যাপয়েন্টমেন্ট নিশ্চিত করুন।",
  "Celebrating a quarter-century of excellence in Barishal, while pioneering advanced diagnostics and shaping the future of integrated healthcare through Apollo Vision 2050.":
    "বরিশালে শ্রেষ্ঠত্বের 25 বছর উদযাপন করছি — উন্নত রোগনির্ণয়ে পথ দেখিয়ে, এ্যাপোলো ভিশন 2050-এর মাধ্যমে সমন্বিত স্বাস্থ্যসেবার ভবিষ্যৎ গড়ছি।",
  "From our pioneering beginnings to our vision for 2050, South Apollo Diagnostic Complex remains committed to delivering advanced, compassionate, and reliable medical care under one roof.":
    "পথচলার শুরু থেকে 2050-এর লক্ষ্য পর্যন্ত, সাউথ এ্যাপোলো ডায়াগনস্টিক কমপ্লেক্স এক ছাদের নিচে উন্নত, সহানুভূতিশীল ও নির্ভরযোগ্য চিকিৎসাসেবা দিতে প্রতিশ্রুতিবদ্ধ।",
  "Building upon 25 years of unwavering community trust to deliver state-of-the-art diagnostics, specialized treatment, and comprehensive medical services for generations to come.":
    "25 বছরের অটুট আস্থার ভিত্তিতে আমরা প্রজন্মের পর প্রজন্মের জন্য অত্যাধুনিক রোগনির্ণয়, বিশেষায়িত চিকিৎসা ও পূর্ণাঙ্গ স্বাস্থ্যসেবা নিশ্চিত করছি।",
  "As we undergo comprehensive refurbishments—upgrading our infrastructure, advanced equipment, and operational systems—our 25-year legacy of trusted healthcare is evolving to serve you better than ever.":
    "অবকাঠামো, আধুনিক যন্ত্রপাতি ও পরিচালনা ব্যবস্থার ব্যাপক সংস্কারের মধ্য দিয়ে আমাদের 25 বছরের বিশ্বস্ত স্বাস্থ্যসেবা আরও উন্নত রূপে আপনার সেবায় আসছে।",
  "Upgrade to booking and online sales whenever you're ready — same site, same login.":
    "প্রস্তুত হলেই বুকিং ও অনলাইন বিক্রয় চালু করুন — একই সাইট, একই লগইন।",
  // Button labels
  "Find Doctor": "ডাক্তার খুঁজুন",
  "Book Online": "অনলাইনে বুক করুন",
  "Book Appointment": "অ্যাপয়েন্টমেন্ট নিন",
  "Contact Us": "যোগাযোগ করুন",
  "Contact Use": "যোগাযোগ করুন",
  "Our Story": "আমাদের গল্প",
  "Our Services": "আমাদের সেবাসমূহ",
  "See News": "সংবাদ দেখুন",
  "Discover Gallery": "গ্যালারি দেখুন",
  "View Products": "পণ্য দেখুন",
};
const HERO_FIELDS = ["heading", "subheading", "primary_cta_label", "secondary_cta_label"];

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
  const counts = { nav: 0, sections: 0, siteText: 0, titles: 0, hero: 0, bodies: 0 };
  try {
    // Neon's pooled endpoint doesn't apply a default search_path (see lib/db.js).
    await client.query("SET search_path TO public");
    for (const table of ["nav_items", "section_headings", "site_text", "hero_slides", ...Object.keys(SECTION_TITLE_TABLES)]) {
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

    // About / Vision & Mission body text: only while the English body is still exactly the text
    // the Bangla was written from (line endings aside) and no Bangla body exists yet.
    const normalizeBody = (text) => (text || "").replace(/\r\n/g, "\n").trim();
    for (const entry of SECTION_BODIES) {
      const { rows } = await client.query(`SELECT body, translations FROM ${entry.table} WHERE id = 1`);
      const row = rows[0];
      if (!row || normalizeBody(row.body) !== entry.en.join("\n")) continue;
      if (!isBlank(row.translations?.bn?.body)) continue;
      await client.query(`UPDATE ${entry.table} SET ${MERGE_BN} WHERE id = 1`, [
        JSON.stringify({ body: entry.bn.join("\n") }),
      ]);
      counts.bodies++;
    }

    const slides = await client.query("SELECT * FROM hero_slides");
    for (const row of slides.rows) {
      const patch = {};
      for (const field of HERO_FIELDS) {
        const bn = HERO_TEXT[(row[field] || "").trim()];
        if (bn && isBlank(row.translations?.bn?.[field])) patch[field] = bn;
      }
      if (!Object.keys(patch).length) continue;
      await client.query(`UPDATE hero_slides SET ${MERGE_BN} WHERE id = $2`, [JSON.stringify(patch), row.id]);
      counts.hero += Object.keys(patch).length;
    }

    console.log(
      `Seeded Bangla: ${counts.nav} nav items, ${counts.sections} section headings, ` +
        `${counts.siteText} site-text fields, ${counts.titles} section titles, ${counts.hero} hero slide fields, ${counts.bodies} section bodies.`
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
