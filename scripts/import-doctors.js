// Imports the doctor directory (/doctors) from the client's spreadsheet, exported as CSV
// (Google Sheets: File → Download → Comma-separated values), and attaches headshots from a
// folder of photos named by the doctor's Bangla name ("অধ্যাপক ডাঃ …jpg").
//
//   node --env-file=.env.local scripts/import-doctors.js <doctors.csv> [--photos <folder>] [--dry-run]
//   node --env-file=.env.local scripts/import-doctors.js --photos-only [--photos <folder>]
//
// Columns are recognised by header text in English or Bangla — "Name (English)", "নাম",
// "Designation", "Speciality (Bengali)", "Visiting hours", "Room", "Fee", … — a header that
// mentions Bangla/Bengali (or is written in Bangla) fills the _bn field, otherwise _en. Run with
// --dry-run first to see the column mapping without writing anything.
//
// Safe to re-run: doctors are matched to existing rows by name (Bangla first, else English) and
// only empty fields are filled, so nothing an admin has since edited is overwritten. Specialties
// are created as needed and given default symptom keywords (scripts/lib/doctor-keywords.js)
// while their keyword lists are still empty. Photos are resized to 480×600 into
// public/images/doctors and only set on doctors who have no photo yet. Also adds "Find a Doctor"
// under the Explore nav dropdown if it isn't there.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Pool } = require("pg");
const sharp = require("sharp");
const KEYWORDS = require("./lib/doctor-keywords");
const { nameKey, nameKeys, bestMatch } = require("./lib/doctor-names");

const ROOT = path.join(__dirname, "..");
const DEFAULT_PHOTO_DIR = path.join(ROOT, "docs", "Apollo Dr Pic");
const PHOTO_OUT_DIR = path.join(ROOT, "public", "images", "doctors");

// ---------- CSV ----------

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  text = text.replace(/^﻿/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim()));
}

// Checked in order — the first rule whose pattern matches a header decides its field, so the
// narrow ones ("Room", "Fee") come before broad ones ("Name").
const FIELD_RULES = [
  ["skip", /^(sl|s\/l|serial no|no\.?|#|ক্রম|ক্রমিক|নং)$/i],
  // Not published: a star rating needs real, verifiable reviews behind it, and the duration
  // isn't something a patient chooses a doctor by.
  ["skip", /rating|review|duration/i],
  ["keywords", /keyword|symptom|disease|উপসর্গ|কীওয়ার্ড/i],
  ["fee", /fee|charge|ফি|ভিজিট ফি/i],
  ["room", /room|chamber no|রুম|কক্ষ/i],
  ["telehealth", /telehealth|telemedicine|online|টেলি|অনলাইন/i],
  ["serial_phone", /phone|mobile|contact|serial|appointment no|ফোন|মোবাইল|সিরিয়াল|যোগাযোগ/i],
  ["expertise", /expert|interest|treat|service|দক্ষতা|চিকিৎসা|সেবা/i],
  ["designation", /designation|position|affiliation|chamber|post|institut|hospital|workplace|পদবি|পদবী|কর্মস্থল|প্রতিষ্ঠান|চেম্বার/i],
  ["schedule", /time|schedule|day|visit|hour|সময়|দিন|বার/i],
  ["specialty", /special|department|dept|discipline|বিভাগ|বিশেষজ্ঞ|বিশেষত্ব/i],
  ["degrees", /degree|qualification|ডিগ্রি|ডিগ্রী|যোগ্যতা/i],
  ["name", /name|doctor|নাম|ডাক্তার/i],
];

const LANGUAGE_NEUTRAL = ["room", "fee", "serial_phone", "telehealth"];

function headerLanguage(header) {
  return /bangla|bengali|বাংলা|\bbn\b/i.test(header) || /[ঀ-৿]/.test(header) ? "bn" : "en";
}

// Returns one { field, explicit } per header (or null to ignore the column). `explicit` means
// the header itself names the language ("… (English)", "… (Bangla)"), so its cells are trusted
// as-is rather than re-routed by script.
function mapColumns(headers) {
  return headers.map((header) => {
    const h = header.trim();
    const rule = FIELD_RULES.find(([, re]) => re.test(h));
    if (!rule || rule[0] === "skip") return null;
    const field = rule[0];
    if (LANGUAGE_NEUTRAL.includes(field)) return { field, explicit: true };
    const explicit = /english|bangla|bengali|বাংলা|ইংরেজি|\b(en|bn)\b/i.test(h);
    return { field: `${field}_${headerLanguage(h)}`, explicit };
  });
}

// A cell written in Bangla script belongs in the _bn field even if its column header didn't
// say so (and vice versa) — combined sheets often mix the two.
function detectLang(value) {
  const bangla = (value.match(/[ঀ-৿]/g) || []).length;
  const latin = (value.match(/[A-Za-z]/g) || []).length;
  if (!bangla && !latin) return null;
  return bangla >= latin ? "bn" : "en";
}

const bnDigitsToLatin = (text) => text.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d));

function rowToDoctor(cells, columns) {
  const doctor = {};
  columns.forEach((column, i) => {
    const value = (cells[i] || "").trim();
    if (!column || !value) return;
    let { field } = column;
    const lang = detectLang(value);
    if (!column.explicit && /_(en|bn)$/.test(field) && lang && !field.endsWith(`_${lang}`)) {
      field = field.replace(/_(en|bn)$/, `_${lang}`);
    }
    doctor[field] = doctor[field] ? `${doctor[field]}\n${value}` : value;
  });

  if (doctor.fee) {
    const digits = bnDigitsToLatin(doctor.fee).replace(/[^\d]/g, "");
    doctor.fee = digits ? parseInt(digits, 10) : null;
  }
  // "Room No-101" → "101"; "Room Not Specified" → nothing.
  if (doctor.room) {
    const room = bnDigitsToLatin(doctor.room)
      .replace(/^(room|রুম|কক্ষ)\s*(no\.?|নং)?\s*[-:.]?\s*/i, "")
      .trim();
    doctor.room = /not specified|n\/?a|^-+$/i.test(room) || !room ? null : room;
  }
  if (doctor.telehealth !== undefined) {
    doctor.telehealth = /^(yes|y|true|1|হ্যাঁ|আছে)$/i.test(doctor.telehealth);
  }
  // Keyword cells are comma-separated in the sheet; stored one per line like the admin form.
  for (const field of ["keywords_en", "keywords_bn"]) {
    if (doctor[field]) {
      doctor[field] = doctor[field]
        .split(/[,،;\n]+/)
        .map((k) => k.trim())
        .filter(Boolean)
        .join("\n");
    }
  }
  // "Orthopedics Department" / "অর্থোপেডিক বিভাগ" → "Orthopedics" / "অর্থোপেডিক" — the
  // finder's filter chips read better without the suffix.
  if (doctor.specialty_en) doctor.specialty_en = doctor.specialty_en.replace(/\s+(department|dept\.?)$/i, "").trim();
  if (doctor.specialty_bn) doctor.specialty_bn = doctor.specialty_bn.replace(/\s+বিভাগ$/, "").trim();
  return doctor;
}

// ---------- Photos ----------

function listPhotos(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .map((f) => ({ keys: nameKeys(f), value: f }));
}

async function savePhoto(dir, file) {
  const slug = `dr-${crypto.createHash("sha1").update(nameKey(file)).digest("hex").slice(0, 10)}.jpg`;
  fs.mkdirSync(PHOTO_OUT_DIR, { recursive: true });
  await sharp(path.join(dir, file))
    .rotate()
    .resize(480, 600, { fit: "cover", position: "north" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(PHOTO_OUT_DIR, slug));
  return `/images/doctors/${slug}`;
}

// ---------- DB ----------

async function ensureTables(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS doctor_specialties (
      id SERIAL PRIMARY KEY,
      name_en VARCHAR(255) NOT NULL,
      name_bn VARCHAR(255),
      keywords_en TEXT,
      keywords_bn TEXT,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
  await client.query(`
    CREATE TABLE IF NOT EXISTS doctors (
      id SERIAL PRIMARY KEY,
      name_en VARCHAR(255),
      name_bn VARCHAR(255),
      degrees_en TEXT,
      degrees_bn TEXT,
      designation_en TEXT,
      designation_bn TEXT,
      expertise_en TEXT,
      expertise_bn TEXT,
      schedule_en TEXT,
      schedule_bn TEXT,
      specialty_id INT REFERENCES doctor_specialties(id) ON DELETE SET NULL,
      room VARCHAR(100),
      fee INT,
      serial_phone VARCHAR(100),
      photo VARCHAR(500),
      display_order INT NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
  await client.query("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS keywords_en TEXT");
  await client.query("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS keywords_bn TEXT");
  await client.query("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS telehealth BOOLEAN NOT NULL DEFAULT false");
}

async function findOrCreateSpecialty(client, cache, nameEn, nameBn) {
  const label = (nameEn || nameBn || "").trim();
  if (!label) return null;
  const cacheKey = label.toLowerCase();
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const { rows } = await client.query(
    "SELECT id FROM doctor_specialties WHERE lower(name_en) = lower($1) OR name_bn = $2 LIMIT 1",
    [nameEn || "", nameBn || ""]
  );
  let id = rows[0]?.id;
  if (!id) {
    const library = KEYWORDS.find((k) => k.match.test(`${nameEn || ""} ${nameBn || ""}`));
    const inserted = await client.query(
      `INSERT INTO doctor_specialties (name_en, name_bn, display_order)
       VALUES ($1, $2, (SELECT COALESCE(MAX(display_order), 0) + 1 FROM doctor_specialties))
       RETURNING id`,
      [nameEn || library?.bn_name || nameBn, nameBn || library?.bn_name || null]
    );
    id = inserted.rows[0].id;
  }
  cache.set(cacheKey, id);
  return id;
}

// The library entry for a specialty name — or, for a combined department ("Medicine & Chest"),
// every entry either half matches, merged.
function keywordsFor(nameEn, nameBn) {
  const parts = `${nameEn}`.split(/\s*&\s*|\s+and\s+/i);
  const entries = [KEYWORDS.find((k) => k.match.test(`${nameEn} ${nameBn || ""}`))];
  if (parts.length > 1) for (const part of parts) entries.push(KEYWORDS.find((k) => k.match.test(part)));
  const found = [...new Set(entries.filter(Boolean))];
  if (!found.length) return null;
  const merge = (lang) => [...new Set(found.flatMap((k) => k[lang]))];
  return { en: merge("en"), bn: merge("bn"), bn_name: found[0].bn_name };
}

// Default keywords for every specialty whose lists are still empty.
async function fillSpecialtyKeywords(client) {
  const { rows } = await client.query(
    "SELECT id, name_en, name_bn FROM doctor_specialties WHERE COALESCE(keywords_en, '') = '' AND COALESCE(keywords_bn, '') = ''"
  );
  let filled = 0;
  for (const s of rows) {
    const library = keywordsFor(s.name_en, s.name_bn);
    if (!library) {
      console.log(`  ! no default keywords for specialty "${s.name_en}" — add them in admin`);
      continue;
    }
    await client.query(
      `UPDATE doctor_specialties SET keywords_en = $1, keywords_bn = $2,
         name_bn = COALESCE(name_bn, $3), updated_at = now() WHERE id = $4`,
      [library.en.join("\n"), library.bn.join("\n"), library.bn_name, s.id]
    );
    filled++;
  }
  return filled;
}

const TEXT_FIELDS = [
  "name_en", "name_bn", "degrees_en", "degrees_bn", "designation_en", "designation_bn",
  "expertise_en", "expertise_bn", "schedule_en", "schedule_bn", "keywords_en", "keywords_bn",
  "room", "fee", "serial_phone",
];

async function upsertDoctor(client, existing, doctor, specialtyId, order) {
  const key = nameKey(doctor.name_bn || doctor.name_en);
  const match = existing.find((e) => e.key && e.key === key);
  if (match) {
    // Fill only what's still empty.
    const sets = [];
    const values = [];
    for (const field of TEXT_FIELDS) {
      if (doctor[field] !== undefined && doctor[field] !== null && doctor[field] !== "") {
        values.push(doctor[field]);
        sets.push(`${field} = COALESCE(NULLIF(${field}::text, ''), $${values.length}::text)::${field === "fee" ? "int" : "text"}`);
      }
    }
    if (specialtyId) {
      values.push(specialtyId);
      sets.push(`specialty_id = COALESCE(specialty_id, $${values.length})`);
    }
    if (doctor.telehealth === true) sets.push("telehealth = true");
    if (sets.length) {
      values.push(match.id);
      await client.query(
        `UPDATE doctors SET ${sets.join(", ")}, updated_at = now() WHERE id = $${values.length}`,
        values
      );
    }
    return "updated";
  }
  const fields = [...TEXT_FIELDS, "telehealth"].filter((f) => doctor[f] !== undefined);
  const values = fields.map((f) => doctor[f]);
  await client.query(
    `INSERT INTO doctors (${[...fields, "specialty_id", "display_order"].join(", ")})
     VALUES (${[...fields, "s", "o"].map((_, i) => `$${i + 1}`).join(", ")})`,
    [...values, specialtyId, order]
  );
  existing.push({ key });
  return "created";
}

async function attachPhotos(client, photoDir) {
  const photos = listPhotos(photoDir);
  if (!photos.length) {
    console.log(`Photos: none found in ${photoDir}`);
    return;
  }
  const { rows: doctors } = await client.query(
    "SELECT id, name_en, name_bn, photo FROM doctors ORDER BY id"
  );
  const used = new Set();
  const unmatchedDoctors = [];
  const fuzzy = [];
  let attached = 0;
  for (const d of doctors) {
    if (!d.name_bn) continue;
    const match = bestMatch(nameKeys(d.name_bn), photos);
    if (!match) {
      if (!d.photo) unmatchedDoctors.push(d.name_bn);
      continue;
    }
    used.add(match.value);
    if (!match.exact) fuzzy.push(`${d.name_bn}  ≈  ${match.value} (${Math.round(match.score * 100)}%)`);
    if (d.photo) continue;
    const url = await savePhoto(photoDir, match.value);
    await client.query("UPDATE doctors SET photo = $1, updated_at = now() WHERE id = $2", [url, d.id]);
    attached++;
  }
  console.log(`Photos: attached ${attached} (of ${photos.length} files)`);
  if (fuzzy.length) console.log(`  close (not exact) name matches — please check:\n    ${fuzzy.join("\n    ")}`);
  if (unmatchedDoctors.length) console.log(`  doctors with no photo match:\n    ${unmatchedDoctors.join("\n    ")}`);
  const unused = photos.filter((p) => !used.has(p.value)).map((p) => p.value);
  if (unused.length) console.log(`  photos not matched to any doctor:\n    ${unused.join("\n    ")}`);
}

// "Find a Doctor" under the Explore nav dropdown, once.
async function ensureNavLink(client) {
  const hasNav = await client.query("SELECT to_regclass('nav_items') AS t");
  if (!hasNav.rows[0].t) return;
  // The header's call-to-action button now leads to the doctor finder: "Book Doctor" →
  // "Find Doctor". Only touches the button while it's still the original one.
  const cta = await client.query(
    `UPDATE nav_items SET label = 'Find Doctor', href = '/doctors', updated_at = now(),
       translations = jsonb_set(COALESCE(translations, '{}'::jsonb), '{bn}',
         COALESCE(translations -> 'bn', '{}'::jsonb) || jsonb_build_object('label', 'ডাক্তার খুঁজুন'::text))
     WHERE cta AND label = 'Book Doctor' AND href = '/booking'`
  );
  if (cta.rowCount) console.log("Nav: header button changed to Find Doctor → /doctors");

  // Same for the find-a-doctor hero slide's button (recognised by its heading or its
  // illustration, since the client retitles slides), while it has no link of its own or still
  // points at the generic booking page.
  const hasHero = await client.query("SELECT to_regclass('hero_slides') AS t");
  if (hasHero.rows[0].t) {
    const hero = await client.query(
      `UPDATE hero_slides SET primary_cta_label = 'Find Doctor', primary_cta_href = '/doctors', updated_at = now()
       WHERE (heading ILIKE 'Find the Right Doctor%' OR heading ILIKE 'Find Your Perfect Doctor%'
              OR background_image ILIKE '%find-doctor%')
         AND COALESCE(primary_cta_href, '') IN ('', '/booking', '/doctors')`
    );
    if (hero.rowCount) console.log("Hero: Find the Right Doctor slide button → Find Doctor, /doctors");
  }

  const existing = await client.query("SELECT 1 FROM nav_items WHERE href = '/doctors' AND NOT cta");
  if (existing.rowCount) return;
  const explore = await client.query(
    "SELECT id FROM nav_items WHERE parent_id IS NULL AND label = 'Explore' LIMIT 1"
  );
  if (!explore.rowCount) {
    console.log("Nav link: no Explore dropdown found — add /doctors at /admin/nav instead");
    return;
  }
  await client.query(
    `INSERT INTO nav_items (parent_id, label, href, display_order, translations)
     VALUES ($1, 'Find a Doctor', '/doctors',
       (SELECT COALESCE(MAX(display_order), 0) + 1 FROM nav_items WHERE parent_id = $1),
       jsonb_build_object('bn', jsonb_build_object('label', 'ডাক্তার খুঁজুন'::text)))`,
    [explore.rows[0].id]
  );
  console.log("Nav link: added Find a Doctor under Explore");
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const photosOnly = args.includes("--photos-only");
  const photoFlag = args.indexOf("--photos");
  const photoDir = photoFlag !== -1 ? path.resolve(args[photoFlag + 1]) : DEFAULT_PHOTO_DIR;
  const csvPath = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--photos");

  let doctors = [];
  if (!photosOnly) {
    if (!csvPath) throw new Error("Pass the CSV export of the doctor list (or --photos-only).");
    const [headers, ...rows] = parseCsv(fs.readFileSync(csvPath, "utf8"));
    const columns = mapColumns(headers);
    console.log("Column mapping:");
    headers.forEach((h, i) => console.log(`  ${JSON.stringify(h)} → ${columns[i]?.field || "(ignored)"}`));
    doctors = rows.map((r) => rowToDoctor(r, columns)).filter((d) => d.name_en || d.name_bn);
    console.log(`Doctors in sheet: ${doctors.length}`);
    if (dryRun) {
      console.log(JSON.stringify(doctors.slice(0, 3), null, 2));
      return;
    }
  }

  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await ensureTables(client);

    if (doctors.length) {
      const { rows } = await client.query("SELECT id, name_en, name_bn FROM doctors");
      const existing = rows.map((r) => ({ id: r.id, key: nameKey(r.name_bn || r.name_en) }));
      const specialtyCache = new Map();
      const counts = { created: 0, updated: 0 };
      for (const [index, d] of doctors.entries()) {
        const specialtyId = await findOrCreateSpecialty(client, specialtyCache, d.specialty_en, d.specialty_bn);
        counts[await upsertDoctor(client, existing, d, specialtyId, index + 1)]++;
      }
      console.log(`Doctors: created ${counts.created}, updated ${counts.updated}`);
    }

    const filled = await fillSpecialtyKeywords(client);
    console.log(`Specialty keywords: filled ${filled}`);

    await attachPhotos(client, photoDir);
    await ensureNavLink(client);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
