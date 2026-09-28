// Bangla for the client's Health Check-up page text, package names/descriptions and gallery
// captions, used by scripts/seed-bn-translations.js. Keyed by the exact English, so text an
// admin has since rewritten is left for them to translate. Test names stay English.

// health_checkup_page column -> [English, Bangla]
const HEALTH_PAGE = {
  eyebrow: ["Since 2002", "2002 সাল থেকে"],
  heading: ["Regular Health Checkup for a Healthy Life", "সুস্থ জীবনের জন্য নিয়মিত স্বাস্থ্য পরীক্ষা"],
  intro: [
    "At South Apollo Diagnostic Complex, we prioritize your well-being through comprehensive screenings and advanced diagnostics. Early detection is the cornerstone of a healthy life.",
    "সাউথ এ্যাপোলো ডায়াগনস্টিক কমপ্লেক্সে আমরা পূর্ণাঙ্গ স্ক্রিনিং ও উন্নত রোগনির্ণয়ের মাধ্যমে আপনার সুস্থতাকে সবচেয়ে বেশি গুরুত্ব দিই। সময়মতো রোগনির্ণয়ই সুস্থ জীবনের মূল ভিত্তি।",
  ],
  awareness_heading: ["Health Awareness", "স্বাস্থ্য সচেতনতা"],
  awareness_body: [
    "Many life-threatening diseases such as high blood pressure, diabetes, heart disease, and kidney or liver complications often develop without any visible symptoms. Early detection through regular check-ups is the most effective way to manage and treat these conditions before they become critical.",
    "উচ্চ রক্তচাপ, ডায়াবেটিস, হৃদরোগ এবং কিডনি বা লিভারের জটিলতার মতো অনেক প্রাণঘাতী রোগ প্রায়ই কোনো দৃশ্যমান লক্ষণ ছাড়াই শরীরে বাসা বাঁধে। নিয়মিত স্বাস্থ্য পরীক্ষার মাধ্যমে সময়মতো রোগনির্ণয়ই এসব রোগ গুরুতর হওয়ার আগে নিয়ন্ত্রণ ও চিকিৎসার সবচেয়ে কার্যকর উপায়।",
  ],
  quote: [
    "Today's Awareness, Tomorrow's Well-being – Get regular health check-ups for yourself and your family.",
    "আজকের সচেতনতা, আগামীর সুস্থতা – নিজের ও পরিবারের জন্য নিয়মিত স্বাস্থ্য পরীক্ষা করান।",
  ],
  why_heading: ["Why Choose South Apollo Diagnostic Complex?", "কেন সাউথ এ্যাপোলো ডায়াগনস্টিক কমপ্লেক্স বেছে নেবেন?"],
  why_items: [
    [
      "World-class technology: We utilize the latest diagnostic equipment for accurate results.",
      "Expert Medical Team: Our staff includes highly experienced and skilled professionals.",
      "Reliable Service: We are committed to fast reports and dependable healthcare.",
      "Customer Care: Enjoy a seamless experience with dedicated care and easy payment facilities.",
    ].join("\n"),
    [
      "বিশ্বমানের প্রযুক্তি: নির্ভুল ফলাফলের জন্য আমরা সর্বাধুনিক রোগনির্ণয় যন্ত্রপাতি ব্যবহার করি।",
      "অভিজ্ঞ চিকিৎসক দল: আমাদের দলে রয়েছেন অত্যন্ত অভিজ্ঞ ও দক্ষ পেশাজীবীরা।",
      "নির্ভরযোগ্য সেবা: দ্রুত রিপোর্ট ও নির্ভরযোগ্য স্বাস্থ্যসেবায় আমরা প্রতিশ্রুতিবদ্ধ।",
      "রোগীসেবা: আন্তরিক যত্ন ও সহজ পেমেন্ট সুবিধাসহ ঝামেলাহীন অভিজ্ঞতা উপভোগ করুন।",
    ].join("\n"),
  ],
  contact_heading: ["Appointment Contacts", "অ্যাপয়েন্টমেন্টের জন্য যোগাযোগ"],
  contact_intro: ["To schedule your health check-up, please contact us at:", "স্বাস্থ্য পরীক্ষার সময় নির্ধারণ করতে যোগাযোগ করুন:"],
};

// English package name -> Bangla name/description (description only filled while the English
// description is still the original one below)
const PACKAGES = {
  "General Health Check-up": {
    name: "জেনারেল হেলথ চেকআপ",
    descriptionEn:
      "This package provides a baseline assessment of your overall health, focusing on vital organ functions and common markers.",
    description:
      "আপনার সার্বিক স্বাস্থ্যের একটি প্রাথমিক মূল্যায়ন, যেখানে শরীরের গুরুত্বপূর্ণ অঙ্গগুলোর কার্যকারিতা ও সাধারণ সূচকগুলো পরীক্ষা করা হয়।",
  },
  "Special Health Check-up (Male)": {
    name: "স্পেশাল হেলথ চেকআপ (পুরুষ)",
    descriptionEn:
      "A detailed health screening tailored to male-specific health concerns, including prostate health and metabolic markers.",
    description:
      "পুরুষদের স্বাস্থ্য-সংক্রান্ত বিশেষ বিষয়গুলো মাথায় রেখে সাজানো একটি বিস্তারিত স্বাস্থ্য পরীক্ষা, যার মধ্যে রয়েছে প্রোস্টেটের স্বাস্থ্য ও মেটাবলিক সূচক।",
  },
  "Special Health Check-up (Female)": {
    name: "স্পেশাল হেলথ চেকআপ (মহিলা)",
    descriptionEn:
      "A comprehensive screening package designed for women, featuring essential breast health and cervical cancer screenings.",
    description:
      "নারীদের জন্য সাজানো একটি পূর্ণাঙ্গ স্ক্রিনিং প্যাকেজ, যার মধ্যে রয়েছে স্তনের স্বাস্থ্য ও জরায়ুমুখ ক্যান্সারের প্রয়োজনীয় স্ক্রিনিং।",
  },
};

// English caption -> Bangla caption
const GALLERY_CAPTIONS = {
  "Prayer Room": "নামাজের কক্ষ",
  "CT Scan": "সিটি স্ক্যান",
  Pathology: "প্যাথলজি",
  "X-Ray": "এক্স-রে",
  "X-Ray Facility": "এক্স-রে সুবিধা",
};

module.exports = { HEALTH_PAGE, PACKAGES, GALLERY_CAPTIONS };
