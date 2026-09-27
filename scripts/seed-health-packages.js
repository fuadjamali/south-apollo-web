// Seeds the Health Check-up page (/health-checkup): the client's page text, the three launch
// packages (with their illustrations from public/images/health-packages — SVG sources in
// docs/health-packages), and a "Health Check-up" link under the Explore nav dropdown. Packages are only
// inserted while health_packages is empty and the page text only while it still has the generic
// install defaults, so anything an admin has already edited is left alone — safe to re-run, and
// safe against production.
//
// Run: node --env-file=.env.local scripts/seed-health-packages.js
// (for another database: DATABASE_URL=... node scripts/seed-health-packages.js)
const { Pool } = require("pg");

const GENERIC_HEADING = "Health Check-up Packages";

const PAGE = {
  eyebrow: "Since 2002",
  heading: "Regular Health Checkup for a Healthy Life",
  intro:
    "At South Apollo Diagnostic Complex, we prioritize your well-being through comprehensive screenings and advanced diagnostics. Early detection is the cornerstone of a healthy life.",
  awareness_heading: "Health Awareness",
  awareness_body:
    "Many life-threatening diseases such as high blood pressure, diabetes, heart disease, and kidney or liver complications often develop without any visible symptoms. Early detection through regular check-ups is the most effective way to manage and treat these conditions before they become critical.",
  quote:
    "Today's Awareness, Tomorrow's Well-being – Get regular health check-ups for yourself and your family.",
  why_heading: "Why Choose South Apollo Diagnostic Complex?",
  why_items: [
    "World-class technology: We utilize the latest diagnostic equipment for accurate results.",
    "Expert Medical Team: Our staff includes highly experienced and skilled professionals.",
    "Reliable Service: We are committed to fast reports and dependable healthcare.",
    "Customer Care: Enjoy a seamless experience with dedicated care and easy payment facilities.",
  ].join("\n"),
  contact_heading: "Appointment Contacts",
  contact_intro: "To schedule your health check-up, please contact us at:",
  hotline: "09617-888892",
  mobiles: "01706-354974, 01711-457444, 01334-940999",
};

const COMMON_TESTS = [
  "CBC",
  "Blood Grouping & Rh Factor",
  "Blood Sugar (Fasting & 2 hrs ABF)",
  "HbA1c",
  "Lipid Profile (Fasting)",
  "Serum Creatinine",
  "SGPT",
  "SGOT",
  "Serum Uric Acid",
  "Serum Electrolytes",
  "TSH",
  "HBsAg",
];

const PACKAGES = [
  {
    name: "General Health Check-up",
    description:
      "This package provides a baseline assessment of your overall health, focusing on vital organ functions and common markers.",
    image: "/images/health-packages/general.jpg",
    previous_price: 7050,
    price: 4230,
    tests: [
      "CBC",
      "Blood Grouping & Rh Factor",
      "RBS",
      "Lipid Profile",
      "Serum Creatinine",
      "SGPT",
      "HBsAg",
      "Urine R/E M/E",
      "ECG",
      "X-Ray Chest",
      "Ultrasonography of Whole Abdomen",
      "Doctor's Consultation Fee",
    ],
  },
  {
    name: "Special Health Check-up (Male)",
    description:
      "A detailed health screening tailored to male-specific health concerns, including prostate health and metabolic markers.",
    image: "/images/health-packages/male.jpg",
    previous_price: 12950,
    price: 7770,
    tests: [
      ...COMMON_TESTS,
      "PSA (Prostate-Specific Antigen)",
      "Urine R/E M/E",
      "ECG",
      "X-Ray Chest",
      "Ultrasonography of Whole Abdomen",
      "Doctor's Consultation Fee",
    ],
  },
  {
    name: "Special Health Check-up (Female)",
    description:
      "A comprehensive screening package designed for women, featuring essential breast health and cervical cancer screenings.",
    image: "/images/health-packages/female.jpg",
    previous_price: 15000,
    price: 9000,
    tests: [
      ...COMMON_TESTS,
      "Pap Smear",
      "ECG",
      "X-Ray Chest",
      "Mammography (Both Breasts)",
      "Ultrasonography of Whole Abdomen",
      "Doctor's Consultation Fee",
    ],
  },
];

const NAV_LINK = { label: "Health Check-up", labelBn: "হেলথ চেকআপ", href: "/health-checkup" };

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Same DDL as lib/healthPackages.js, so this works before the page has ever been visited.
    await client.query(`
      CREATE TABLE IF NOT EXISTS health_packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        previous_price INT,
        price INT NOT NULL,
        tests TEXT,
        display_order INT NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);
    await client.query("ALTER TABLE health_packages ADD COLUMN IF NOT EXISTS image TEXT");
    await client.query(`
      CREATE TABLE IF NOT EXISTS health_checkup_page (
        id INT PRIMARY KEY,
        eyebrow VARCHAR(100),
        heading VARCHAR(255) NOT NULL,
        intro TEXT,
        awareness_heading VARCHAR(255),
        awareness_body TEXT,
        quote TEXT,
        why_heading VARCHAR(255),
        why_items TEXT,
        contact_heading VARCHAR(255),
        contact_intro TEXT,
        hotline VARCHAR(100),
        mobiles VARCHAR(255),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);

    const columns = Object.keys(PAGE);
    const values = columns.map((c) => PAGE[c]);
    const page = await client.query(
      `INSERT INTO health_checkup_page (id, ${columns.join(", ")})
       VALUES (1, ${columns.map((_, i) => `$${i + 1}`).join(", ")})
       ON CONFLICT (id) DO UPDATE SET ${columns.map((c) => `${c} = EXCLUDED.${c}`).join(", ")}, updated_at = now()
       WHERE health_checkup_page.heading = $${columns.length + 1}`,
      [...values, GENERIC_HEADING]
    );
    console.log(page.rowCount ? "Page text: seeded" : "Page text: already edited, left alone");

    const { rows } = await client.query("SELECT COUNT(*)::int AS count FROM health_packages");
    if (rows[0].count === 0) {
      for (const [index, pkg] of PACKAGES.entries()) {
        await client.query(
          `INSERT INTO health_packages (name, description, image, previous_price, price, tests, display_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [pkg.name, pkg.description, pkg.image, pkg.previous_price, pkg.price, pkg.tests.join("\n"), index + 1]
        );
      }
      console.log(`Packages: inserted ${PACKAGES.length}`);
    } else {
      console.log(`Packages: ${rows[0].count} already present, left alone`);
      // Packages seeded before images existed: fill in the illustration, matched by name, only
      // where no image has been set — never replaces one an admin uploaded.
      let filled = 0;
      for (const pkg of PACKAGES) {
        const res = await client.query(
          "UPDATE health_packages SET image = $1, updated_at = now() WHERE name = $2 AND image IS NULL",
          [pkg.image, pkg.name]
        );
        filled += res.rowCount;
      }
      console.log(`Package images: filled ${filled}`);
    }

    const existing = await client.query("SELECT 1 FROM nav_items WHERE href = $1", [NAV_LINK.href]);
    const explore = await client.query(
      "SELECT id FROM nav_items WHERE parent_id IS NULL AND label = 'Explore' LIMIT 1"
    );
    if (existing.rowCount) {
      console.log("Nav link: already present");
    } else if (!explore.rowCount) {
      console.log("Nav link: no Explore dropdown found — add it at /admin/nav instead");
    } else {
      await client.query(
        `INSERT INTO nav_items (parent_id, label, href, display_order, translations)
         VALUES ($1, $2, $3,
           (SELECT COALESCE(MAX(display_order), 0) + 1 FROM nav_items WHERE parent_id = $1),
           jsonb_build_object('bn', jsonb_build_object('label', $4::text)))`,
        [explore.rows[0].id, NAV_LINK.label, NAV_LINK.href, NAV_LINK.labelBn]
      );
      console.log("Nav link: added under Explore");
    }

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
  console.error(err);
  process.exit(1);
});
