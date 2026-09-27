// Doctor finder search — pure functions, run in the browser by components/DoctorFinder.js so
// results update on every keystroke with no round trip (the whole directory is a few dozen to a
// few hundred rows). A query is matched against both languages at once, whatever the page
// language: a patient on the English page can type "বুকে ব্যথা" and one on the Bangla page can
// type "chest pain".

// Words that carry no search meaning in a patient's sentence ("I have pain in my chest",
// "আমার বুকে ব্যথা হচ্ছে") and titles that are on every doctor's name.
const STOPWORDS = new Set([
  "dr", "doctor", "prof", "professor", "assoc", "asst", "i", "im", "have", "has", "having",
  "a", "an", "the", "of", "and", "or", "for", "with", "in", "on", "my", "me", "is", "am", "are",
  "problem", "problems", "issue", "issues", "need", "want", "find", "specialist", "consultant",
  "ডাঃ", "ডা", "ডাক্তার", "অধ্যাপক", "প্রফেসর", "আমার", "আমি", "আছে", "হচ্ছে", "হয়", "করছে",
  "সমস্যা", "এর", "ও", "এবং", "কি", "কী", "জন্য", "একটু", "খুব", "বিশেষজ্ঞ",
]);

// Symptom words too general to pick a doctor on their own.
const GENERIC = new Set(["pain", "ache", "aching", "swelling", "ব্যথা", "ব্যাথা", "যন্ত্রণা", "ফোলা", "অসুখ", "রোগ", "কম", "বেশি"]);

// Common Bangla inflections a patient adds that the keyword list won't have: "বুকে" (in the
// chest) → "বুক", "মাথার" → "মাথা", "হাঁটুতে" → "হাঁটু". Longest first.
const BN_SUFFIXES = ["গুলো", "দের", "টা", "টি", "তে", "ের", "য়", "কে", "র", "ে"];

export function normalize(text) {
  return (text || "")
    .toString()
    .normalize("NFC")
    .toLowerCase()
    .replace(/[‌‍]/g, "") // zero-width (non-)joiners from some Bangla keyboards
    .replace(/ব্যাথা/g, "ব্যথা") // the everyday misspelling of "pain"
    .replace(/[ঃ:]/g, " ")
    .replace(/[.,;()/\\\-–—'"!?]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(query) {
  return normalize(query)
    .split(" ")
    .filter((t) => t && !STOPWORDS.has(t));
}

// Every plausible stem, not just the first suffix that fits: "বুকে" ends in both "কে" and "ে",
// and only "বুক" is right. Stems under 3 code units ("বু") are too short to mean anything and
// would match inside unrelated words.
function stems(token) {
  return BN_SUFFIXES.filter((suffix) => token.endsWith(suffix))
    .map((suffix) => token.slice(0, -suffix.length))
    .filter((s) => s.length >= 3);
}

// Haystacks are stored with a leading space (see buildIndex) so a Latin-script token can be
// matched at the start of a word — "ear" must not match "heart", while "diab" still finds
// "diabetes". Bangla is matched anywhere in the text, since inflections and compounds
// ("হৃদরোগ", "বুকে") make word starts unreliable. Stemming is for symptom words only
// (`allowStem`); names aren't inflected, and a stem matching inside a name is always wrong.
function includesToken(haystack, token, allowStem = true) {
  if (/^[a-z0-9]/.test(token)) return haystack.includes(` ${token}`);
  if (haystack.includes(token)) return true;
  return allowStem && stems(token).some((s) => haystack.includes(s));
}

const hay = (...parts) => ` ${normalize(parts.filter(Boolean).join(" "))}`;

// Precompute one lowercase haystack per weighted field group for each doctor.
export function buildIndex(doctors) {
  return doctors.map((d) => ({
    doctor: d,
    name: hay(d.name_en, d.name_bn),
    specialty: hay(d.specialty_en, d.specialty_bn),
    profile: hay(d.degrees_en, d.degrees_bn, d.designation_en, d.designation_bn, d.expertise_en, d.expertise_bn),
    keywords: hay(d.keywords_en, d.keywords_bn, d.specialty_keywords_en, d.specialty_keywords_bn),
    // The department as a whole — used for the ranking bonus below.
    topic: hay(d.specialty_en, d.specialty_bn, d.specialty_keywords_en, d.specialty_keywords_bn),
  }));
}

// A doctor whose department covers the whole query outranks one who only has a word or two of
// it in their own keywords: "বুকে ব্যথা" lists cardiologists before the gastroenterologist
// who happens to treat heartburn.
const TOPIC_BONUS = 5;

const WEIGHTS = { name: 10, specialty: 6, profile: 4, keywords: 3 };

function scoreToken(entry, token) {
  let best = 0;
  for (const [field, weight] of Object.entries(WEIGHTS)) {
    if (weight > best && includesToken(entry[field], token, field !== "name")) best = weight;
  }
  return best;
}

// Every meaningful word must match somewhere; if that finds nobody (a long sentence with one
// stray word), fall back to doctors matching any word, best matches first.
export function searchDoctors(index, query, specialtyId = null) {
  const pool = specialtyId ? index.filter((e) => e.doctor.specialty_id === specialtyId) : index;
  const words = tokens(query);
  if (words.length === 0) return { results: pool.map((e) => e.doctor), loose: false };

  const scored = pool.map((entry) => {
    const scores = words.map((w) => scoreToken(entry, w));
    const topical = words.every((w) => includesToken(entry.topic, w));
    return {
      doctor: entry.doctor,
      all: scores.every((s) => s > 0),
      total: scores.reduce((a, b) => a + b, 0) + (topical ? TOPIC_BONUS : 0),
    };
  });

  const strict = scored.filter((s) => s.all);
  const loose = strict.length === 0;
  // The loose fallback only counts distinctive words — "stomach pain" with no stomach doctor
  // must not list every doctor whose keywords happen to contain "pain".
  const distinctive = words.map((w) => !GENERIC.has(w));
  const looseHits = scored.filter((s, i) =>
    words.some((w, j) => distinctive[j] && scoreToken(pool[i], w) > 0)
  );
  const hits = (loose ? looseHits : strict).sort(
    (a, b) => b.total - a.total || (a.doctor.display_order ?? 0) - (b.doctor.display_order ?? 0)
  );
  return { results: hits.map((h) => h.doctor), loose };
}

// Specialties whose name or symptom keywords match the query — the finder shows these as
// "Suggested specialty" so the patient learns which kind of doctor fits their problem.
export function suggestSpecialties(specialties, query) {
  const words = tokens(query);
  if (words.length === 0) return [];
  return specialties.filter((s) => {
    const text = hay(s.name_en, s.name_bn, s.keywords_en, s.keywords_bn);
    return words.every((w) => includesToken(text, w));
  });
}

// One-tap starting points for patients who don't know where to begin. Each `q` is a term that
// appears in the default specialty keyword lists (scripts/import-doctors.js), so it matches
// whichever specialty the client's data maps it to.
export const FINDER_PROBLEMS = [
  { en: "Chest pain", bn: "বুকে ব্যথা", q: "chest pain" },
  { en: "Fever", bn: "জ্বর", q: "fever" },
  { en: "Diabetes", bn: "ডায়াবেটিস", q: "diabetes" },
  { en: "High blood pressure", bn: "উচ্চ রক্তচাপ", q: "blood pressure" },
  { en: "Back / joint pain", bn: "কোমর / জোড়ায় ব্যথা", q: "joint pain" },
  { en: "Headache", bn: "মাথা ব্যথা", q: "headache" },
  { en: "Stomach problem", bn: "পেটের সমস্যা", q: "stomach" },
  { en: "Skin problem", bn: "চর্মরোগ", q: "skin" },
  { en: "Ear, nose, throat", bn: "নাক, কান, গলা", q: "ear nose throat" },
  { en: "Pregnancy", bn: "গর্ভাবস্থা", q: "pregnancy" },
  { en: "Child's illness", bn: "শিশুর অসুখ", q: "child" },
  { en: "Kidney / urine", bn: "কিডনি / প্রস্রাব", q: "kidney" },
  { en: "Eye problem", bn: "চোখের সমস্যা", q: "eye" },
  { en: "Anxiety / depression", bn: "দুশ্চিন্তা / বিষণ্নতা", q: "depression" },
];
