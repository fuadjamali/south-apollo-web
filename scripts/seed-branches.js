// Seeds the clinic's two branches (home "Our Branches" section) from the letterhead — only while
// the branches table is empty, so anything since edited at /admin/branches is left alone.
//
//   node --env-file=.env.local scripts/seed-branches.js
//   (another database: DATABASE_URL=... node scripts/seed-branches.js)
const { Pool } = require("pg");

const BRANCHES = [
  {
    name_en: "Sadar Road Branch",
    name_bn: "সদর রোড শাখা",
    intro_en: "Our main branch on Sadar Road, in the heart of Barishal city.",
    intro_bn: "বরিশাল শহরের প্রাণকেন্দ্র সদর রোডে আমাদের প্রধান শাখা।",
    address_en: "135, Bir Shrestho Captain Mohiuddin Jahangir Road (Sadar Road), Barishal, Bangladesh",
    address_bn: "135, বীরশ্রেষ্ঠ ক্যাপ্টেন মহিউদ্দিন জাহাঙ্গীর সড়ক (সদর রোড), বরিশাল, বাংলাদেশ",
    phones: ["Hotline: 09617-888892", "Tel: 02478865536", "Mobile: 01711-457444, 01706-354974, 01334-940999"].join("\n"),
    is_main: true,
    display_order: 1,
  },
  {
    name_en: "Medical College Branch",
    name_bn: "মেডিকেল কলেজ শাখা",
    intro_en: "Our branch on Band Road, close to Sher-e-Bangla Medical College Hospital.",
    intro_bn: "শের-ই-বাংলা মেডিকেল কলেজ হাসপাতালের কাছে, বান্দ রোডে আমাদের শাখা।",
    address_en: "Band Road, Barishal, Bangladesh",
    address_bn: "বান্দ রোড, বরিশাল, বাংলাদেশ",
    phones: ["Tel: 02478872033, 02478872034", "Mobile: 01714-067886, 01706-354975, 01334-940998"].join("\n"),
    is_main: false,
    display_order: 2,
  },
];

(async () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS branches (
        id SERIAL PRIMARY KEY,
        name_en VARCHAR(255) NOT NULL,
        name_bn VARCHAR(255),
        intro_en TEXT,
        intro_bn TEXT,
        address_en TEXT,
        address_bn TEXT,
        phones TEXT,
        map_query TEXT,
        is_main BOOLEAN NOT NULL DEFAULT false,
        display_order INT NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);
    const { rows } = await client.query("SELECT COUNT(*)::int AS count FROM branches");
    if (rows[0].count > 0) {
      console.log(`Branches: ${rows[0].count} already present, left alone`);
    } else {
      for (const b of BRANCHES) {
        const fields = Object.keys(b);
        await client.query(
          `INSERT INTO branches (${fields.join(", ")}) VALUES (${fields.map((_, i) => `$${i + 1}`).join(", ")})`,
          fields.map((f) => b[f])
        );
      }
      console.log(`Branches: inserted ${BRANCHES.length}`);
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
})().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
