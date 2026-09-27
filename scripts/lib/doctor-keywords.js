// Default symptom / disease keywords per kind of specialty, English and Bangla, used by
// scripts/import-doctors.js to pre-fill doctor_specialties.keywords_en / keywords_bn so the
// finder works from day one. Matched against a specialty's name (either language) with `match`;
// the first entry whose pattern matches wins, so specific kinds come before general Medicine and
// Surgery; the client refines the lists afterwards at /admin/doctors/specialties. Terms are what patients
// actually say, plus the disease names they're likely to have been told.
module.exports = [
  {
    match: /cardiovascular|cardiac surg|heart surg|cardiothoracic|কার্ডিওভাস্কুলার|হার্ট সার্জ/i,
    bn_name: "হৃদপিণ্ড ও রক্তনালী সার্জারি",
    en: ["heart surgery", "bypass", "open heart surgery", "valve", "blocked artery", "vascular", "varicose veins", "chest pain"],
    bn: ["হার্ট সার্জারি", "বাইপাস", "ওপেন হার্ট সার্জারি", "ভাল্ভ", "রক্তনালী ব্লক", "ভেরিকোস ভেইন", "বুকে ব্যথা"],
  },
  {
    match: /cardi|heart|হৃদ|হার্ট|কার্ডি/i,
    bn_name: "হৃদরোগ",
    en: ["heart", "chest pain", "palpitation", "blood pressure", "hypertension", "heart attack", "breathlessness", "angina", "cholesterol", "ecg", "echo"],
    bn: ["হার্ট", "হৃদরোগ", "বুক ব্যথা", "বুকে ব্যথা", "বুক ধড়ফড়", "উচ্চ রক্তচাপ", "প্রেসার", "হার্ট অ্যাটাক", "শ্বাসকষ্ট", "কোলেস্টেরল"],
  },
  {
    match: /diabet|endocrin|hormone|thyroid|ডায়াবেট|হরমোন|থাইরয়েড|এন্ডোক্রাইন/i,
    bn_name: "ডায়াবেটিস ও হরমোন",
    en: ["diabetes", "sugar", "thyroid", "hormone", "obesity", "weight gain", "goitre", "insulin"],
    bn: ["ডায়াবেটিস", "সুগার", "থাইরয়েড", "হরমোন", "ওজন বৃদ্ধি", "স্থূলতা", "গলগণ্ড", "ইনসুলিন"],
  },
  {
    match: /chest|respir|pulmo|lung|asthma|বক্ষ|ফুসফুস|অ্যাজমা|শ্বাস/i,
    bn_name: "বক্ষব্যাধি",
    en: ["cough", "asthma", "breathlessness", "lung", "tuberculosis", "tb", "pneumonia", "copd", "allergy cough", "wheezing"],
    bn: ["কাশি", "হাঁপানি", "অ্যাজমা", "শ্বাসকষ্ট", "ফুসফুস", "যক্ষ্মা", "নিউমোনিয়া", "বুকে কফ"],
  },
  {
    match: /gastro|liver|hepat|stomach|digest|পরিপাক|লিভার|গ্যাস্ট্রো|পেট/i,
    bn_name: "পরিপাকতন্ত্র ও লিভার",
    en: ["stomach", "gastric", "acidity", "ulcer", "liver", "jaundice", "hepatitis", "constipation", "diarrhoea", "vomiting", "piles", "ibs", "fatty liver"],
    bn: ["পেট ব্যথা", "পেটের সমস্যা", "গ্যাস্ট্রিক", "এসিডিটি", "আলসার", "লিভার", "জন্ডিস", "হেপাটাইটিস", "কোষ্ঠকাঠিন্য", "ডায়রিয়া", "বমি", "পাইলস", "ফ্যাটি লিভার"],
  },
  {
    match: /nephro|kidney|কিডনি|নেফ্রো/i,
    bn_name: "কিডনি",
    en: ["kidney", "creatinine", "dialysis", "swelling", "protein in urine", "kidney failure"],
    bn: ["কিডনি", "ক্রিয়েটিনিন", "ডায়ালাইসিস", "শরীর ফোলা", "প্রস্রাবে প্রোটিন"],
  },
  {
    match: /\burolog|ইউরো|মূত্র/i,
    bn_name: "ইউরোলজি",
    en: ["urine", "urinary", "kidney stone", "prostate", "burning urination", "bladder", "sexual problem"],
    bn: ["প্রস্রাব", "প্রস্রাবে জ্বালা", "কিডনিতে পাথর", "পাথর", "প্রোস্টেট", "মূত্রথলি", "যৌন সমস্যা"],
  },
  {
    match: /neurosurg|নিউরোসার্জ|মস্তিষ্ক ও স্নায়ু সার্জ/i,
    bn_name: "নিউরোসার্জারি",
    en: ["brain tumour", "spine", "disc prolapse", "head injury", "back pain", "slip disc"],
    bn: ["ব্রেন টিউমার", "মেরুদণ্ড", "ডিস্ক", "মাথায় আঘাত", "কোমর ব্যথা"],
  },
  {
    match: /neuro|brain|nerve|stroke|স্নায়ু|নিউরো|মস্তিষ্ক/i,
    bn_name: "নিউরোলজি",
    en: ["headache", "migraine", "stroke", "paralysis", "epilepsy", "seizure", "dizziness", "vertigo", "numbness", "nerve", "memory loss", "parkinson"],
    bn: ["মাথা ব্যথা", "মাইগ্রেন", "স্ট্রোক", "প্যারালাইসিস", "খিঁচুনি", "মৃগী", "মাথা ঘোরা", "ঝিঁঝিঁ", "অবশ", "স্নায়ু", "ভুলে যাওয়া"],
  },
  {
    match: /ortho|bone|joint|trauma|হাড়|অর্থো|জোড়া/i,
    bn_name: "হাড় ও জোড়া",
    en: ["bone", "joint pain", "back pain", "knee pain", "fracture", "arthritis", "neck pain", "shoulder pain", "sports injury", "slip disc"],
    bn: ["হাড়", "জোড়ায় ব্যথা", "কোমর ব্যথা", "হাঁটু ব্যথা", "হাড় ভাঙা", "বাত", "ঘাড় ব্যথা", "কাঁধ ব্যথা"],
  },
  {
    match: /rheumat|physical med|pain|arthritis|বাত|ফিজিক্যাল|ব্যথা/i,
    bn_name: "বাত ও ব্যথা",
    en: ["joint pain", "arthritis", "back pain", "neck pain", "rheumatism", "gout", "frozen shoulder", "paralysis rehab", "physiotherapy"],
    bn: ["জোড়ায় ব্যথা", "বাত", "কোমর ব্যথা", "ঘাড় ব্যথা", "গেঁটে বাত", "কাঁধ জমে যাওয়া", "ফিজিওথেরাপি"],
  },
  {
    match: /gyn|obs|obstet|women|স্ত্রী|গাইনি|প্রসূতি/i,
    bn_name: "গাইনি ও প্রসূতি",
    en: ["pregnancy", "period", "menstrual", "pcos", "infertility", "white discharge", "delivery", "caesarean", "menopause", "women health"],
    bn: ["গর্ভাবস্থা", "মাসিক", "পিরিয়ড", "অনিয়মিত মাসিক", "বন্ধ্যাত্ব", "সাদা স্রাব", "প্রসব", "সিজার", "মেনোপজ"],
  },
  {
    match: /(paediat|pediat)\w*\s+surg|শিশু সার্জ/i,
    bn_name: "শিশু সার্জারি",
    en: ["child surgery", "hernia in child", "hydrocele", "undescended testis", "circumcision", "cleft lip", "child appendix"],
    bn: ["শিশুর অপারেশন", "শিশুর হার্নিয়া", "হাইড্রোসিল", "খৎনা", "মুসলমানি", "ঠোঁট কাটা"],
  },
  {
    match: /paediat|pediat|child|neonat|শিশু/i,
    bn_name: "শিশু রোগ",
    en: ["child", "baby", "newborn", "kids fever", "vaccination", "child cough", "growth", "neonatal"],
    bn: ["শিশু", "বাচ্চা", "নবজাতক", "শিশুর জ্বর", "টিকা", "শিশুর কাশি", "বৃদ্ধি"],
  },
  {
    match: /\bent\b|\bear\b|nose|throat|otolaryn|নাক|কান|গলা/i,
    bn_name: "নাক, কান ও গলা",
    en: ["ear", "nose", "throat", "sinus", "tonsil", "hearing loss", "ear pain", "voice", "snoring", "nose bleeding"],
    bn: ["কান", "নাক", "গলা", "সাইনাস", "টনসিল", "কানে কম শোনা", "কান ব্যথা", "গলা ব্যথা", "নাক ডাকা"],
  },
  {
    match: /eye|ophthal|চক্ষু|চোখ/i,
    bn_name: "চক্ষু",
    en: ["eye", "vision", "cataract", "glaucoma", "glasses", "red eye", "eye pain"],
    bn: ["চোখ", "চোখে কম দেখা", "ছানি", "গ্লুকোমা", "চশমা", "চোখ লাল", "চোখ ব্যথা"],
  },
  {
    match: /derma|skin|venere|sex|চর্ম|যৌন|ত্বক/i,
    bn_name: "চর্ম ও যৌন",
    en: ["skin", "rash", "itching", "allergy", "acne", "pimple", "hair fall", "eczema", "fungal infection", "psoriasis", "sexual disease"],
    bn: ["চর্মরোগ", "ত্বক", "চামড়া", "চুলকানি", "অ্যালার্জি", "ব্রণ", "চুল পড়া", "একজিমা", "দাদ", "ছত্রাক", "যৌন রোগ"],
  },
  {
    match: /psych|mental|মানসিক|সাইকি/i,
    bn_name: "মানসিক রোগ",
    en: ["depression", "anxiety", "stress", "insomnia", "sleep problem", "mental health", "addiction", "panic"],
    bn: ["বিষণ্নতা", "দুশ্চিন্তা", "মানসিক চাপ", "ঘুম না হওয়া", "অনিদ্রা", "মানসিক", "মাদকাসক্তি", "আতঙ্ক"],
  },
  {
    match: /palliative|প্যালিয়েটিভ/i,
    bn_name: "প্যালিয়েটিভ মেডিসিন",
    en: ["palliative care", "cancer pain", "chronic pain", "terminal illness", "bedridden", "elderly care", "end of life care"],
    bn: ["প্যালিয়েটিভ কেয়ার", "ক্যান্সারের ব্যথা", "দীর্ঘমেয়াদি ব্যথা", "শয্যাশায়ী রোগী", "বয়স্ক সেবা"],
  },
  {
    match: /plastic|cosmetic|reconstruct|প্লাস্টিক|কসমেটিক/i,
    bn_name: "প্লাস্টিক সার্জারি",
    en: ["burn", "scar", "keloid", "cleft lip", "cosmetic surgery", "reconstructive surgery", "skin graft"],
    bn: ["পোড়া", "আগুনে পোড়া", "দাগ", "কেলয়েড", "ঠোঁট কাটা", "কসমেটিক সার্জারি"],
  },
  {
    match: /onco|cancer|tumou?r|ক্যান্সার|অনকো/i,
    bn_name: "ক্যান্সার",
    en: ["cancer", "tumour", "lump", "chemotherapy", "breast lump"],
    bn: ["ক্যান্সার", "টিউমার", "চাকা", "কেমোথেরাপি", "স্তনে চাকা"],
  },
  {
    match: /medicine|internal|মেডিসিন/i,
    bn_name: "মেডিসিন",
    en: ["fever", "weakness", "cold", "cough", "diabetes", "blood pressure", "typhoid", "dengue", "general health", "body ache", "infection"],
    bn: ["জ্বর", "দুর্বলতা", "সর্দি", "কাশি", "ডায়াবেটিস", "প্রেসার", "টাইফয়েড", "ডেঙ্গু", "শরীর ব্যথা", "ইনফেকশন"],
  },
  {
    match: /dent|tooth|oral|দন্ত|দাঁত/i,
    bn_name: "দন্ত",
    en: ["tooth", "teeth", "toothache", "gum", "dental", "root canal", "braces"],
    bn: ["দাঁত", "দাঁত ব্যথা", "মাড়ি", "রুট ক্যানেল", "দাঁতের সমস্যা"],
  },
  {
    match: /haemat|hemat|blood|রক্ত/i,
    bn_name: "রক্তরোগ",
    en: ["anaemia", "blood", "thalassemia", "low hemoglobin", "bleeding"],
    bn: ["রক্তশূন্যতা", "রক্ত", "থ্যালাসেমিয়া", "হিমোগ্লোবিন কম"],
  },
  {
    match: /nutri|diet|পুষ্টি|ডায়েট/i,
    bn_name: "পুষ্টি ও ডায়েট",
    en: ["diet", "nutrition", "weight loss", "obesity", "diet chart"],
    bn: ["ডায়েট", "পুষ্টি", "ওজন কমানো", "খাদ্য তালিকা"],
  },
  {
    match: /physio|ফিজিও/i,
    bn_name: "ফিজিওথেরাপি",
    en: ["physiotherapy", "back pain", "neck pain", "stroke rehab", "paralysis", "sports injury"],
    bn: ["ফিজিওথেরাপি", "কোমর ব্যথা", "ঘাড় ব্যথা", "প্যারালাইসিস"],
  },
  {
    match: /radiol|sonol|imaging|ultra|রেডিও|সনো|আল্ট্রা/i,
    bn_name: "রেডিওলজি ও ইমেজিং",
    en: ["ultrasound", "ultrasonography", "x-ray", "ct scan", "mri", "echo", "imaging"],
    bn: ["আলট্রাসনোগ্রাফি", "আল্ট্রাসাউন্ড", "এক্স-রে", "সিটি স্ক্যান", "এমআরআই"],
  },
  {
    match: /surg|সার্জারি|শল্য/i,
    bn_name: "সার্জারি",
    en: ["surgery", "operation", "hernia", "appendix", "gallstone", "piles", "fistula", "lump", "breast lump", "laparoscopic"],
    bn: ["সার্জারি", "অপারেশন", "হার্নিয়া", "অ্যাপেন্ডিক্স", "পিত্তথলিতে পাথর", "পাইলস", "ফিস্টুলা", "চাকা"],
  },
];
