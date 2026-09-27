// Name matching for the doctor import: the spreadsheet, the headshot file names and whatever an
// admin later types all spell the same Bangla name slightly differently ("অধ্যাপক ডাঃ মোঃ …",
// "ডা. মো: …", a trailing space, a nickname in brackets, "শাহ্" vs "শাহ"). `nameKey` reduces
// a name to a comparable form; `bestMatch` finds the closest key, but only when it's clearly
// the right one — an unsure match is reported rather than guessed.
const TITLES = [
  "সহযোগী অধ্যাপক",
  "সহকারী অধ্যাপক",
  "অধ্যাপক",
  "প্রফেসর",
  "প্রফেঃ",
  "প্রফে",
  "ডাক্তার",
  "ডাঃ",
  "ডা:",
  "ডা.",
  "ডা",
  "prof.",
  "prof",
  "professor",
  "dr.",
  "dr",
];

function baseName(name) {
  let s = (name || "").normalize("NFC").replace(/[‌‍]/g, "").toLowerCase();
  s = s.replace(/\.(jpe?g|png|webp)$/i, "");
  s = s.replace(/[।.,:;'"_]+/g, " ").replace(/\s+/g, " ").trim();
  // Titles can be stacked ("অধ্যাপক ডাঃ"), so strip repeatedly from the front.
  let changed = true;
  while (changed) {
    changed = false;
    for (const title of TITLES) {
      const t = title.replace(/[.:]/g, "").trim();
      if (s === t) continue;
      if (s.startsWith(`${t} `)) {
        s = s.slice(t.length).trim();
        changed = true;
      }
    }
  }
  return s
    .replace(/ঃ/g, "") // মোঃ → মো, মুঃ → মু
    .replace(/্(?=\s|$)/g, "") // শাহ্ → শাহ
    .replace(/[-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Key without the bracketed nickname and without spaces: "মো মনিরুজ্জামান (শাহিন)" →
// "মোমনিরুজ্জামান".
function nameKey(name) {
  return baseName(name).replace(/\([^)]*\)/g, "").replace(/[()\s]/g, "");
}

// Every reasonable way the same name gets written: with and without the bracketed nickname
// ("মেহেদী হাসান (বাপ্পু)" vs "মেহেদী হাসান বাপ্পু"), and with and without a leading মো/মু
// ("মোঃ শফিকুজ্জামান অপু" vs "শফিকুজ্জামান অপু").
function nameKeys(name) {
  const base = baseName(name);
  const forms = [base.replace(/\([^)]*\)/g, ""), base.replace(/[()]/g, "")];
  const keys = new Set();
  for (const form of forms) {
    const compact = form.replace(/\s+/g, "");
    keys.add(compact);
    const withoutMd = form.trim().replace(/^(মো|মু)\s+/, "").replace(/\s+/g, "");
    keys.add(withoutMd);
  }
  return [...keys].filter(Boolean);
}

function levenshtein(a, b) {
  const a1 = [...a];
  const b1 = [...b];
  let prev = Array.from({ length: b1.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a1.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b1.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a1[i - 1] === b1[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b1.length];
}

function similarity(a, b) {
  if (!a || !b) return 0;
  return 1 - levenshtein(a, b) / Math.max([...a].length, [...b].length);
}

// `keys`: the nameKeys() of the name being looked up; `candidates`: [{ keys, value }]. Returns
// { value, score, exact } or null. Exact means some spelling of both names is identical; that
// must be unique too. A fuzzy match must score at least `min` and beat the runner-up by
// `margin`, so two similar names never get each other's photo.
function bestMatch(keys, candidates, { min = 0.82, margin = 0.08 } = {}) {
  const score = (c) => Math.max(...keys.flatMap((k) => c.keys.map((ck) => (k === ck ? 1 : similarity(k, ck)))));
  const ranked = candidates.map((c) => ({ value: c.value, score: score(c) })).sort((x, y) => y.score - x.score);
  if (ranked[0]?.score === 1) {
    return ranked[1]?.score === 1 ? null : { value: ranked[0].value, score: 1, exact: true };
  }
  const [first, second] = ranked;
  if (!first || first.score < min) return null;
  if (second && first.score - second.score < margin) return null;
  return { value: first.value, score: first.score, exact: false };
}

module.exports = { baseName, nameKey, nameKeys, similarity, bestMatch };
