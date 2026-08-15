import { db } from "@/lib/db";

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      member_id VARCHAR(50) UNIQUE NOT NULL,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      mobile_no VARCHAR(50),
      email VARCHAR(255),
      membership_status VARCHAR(20) NOT NULL DEFAULT 'Active'
        CHECK (membership_status IN ('Active', 'Expired', 'Suspended')),
      address_line1 VARCHAR(255),
      address_line2 VARCHAR(255),
      city VARCHAR(100),
      postcode VARCHAR(20),
      county VARCHAR(100),
      country VARCHAR(100),
      additional_details TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

// Same placeholder-content convention as every other CRUD section — includes a postcode so
// the public verification form has something real to test against on a fresh install.
const DEFAULT_MEMBERS = [
  {
    member_id: "MEM-0001",
    first_name: "MEMBER_1_FIRST_NAME",
    last_name: "MEMBER_1_LAST_NAME",
    membership_status: "Active",
    postcode: "AB1 2CD",
  },
];

async function seedIfEmpty() {
  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM members");
  if (rows[0].count > 0) return;

  for (const m of DEFAULT_MEMBERS) {
    await db.query(
      `INSERT INTO members (member_id, first_name, last_name, membership_status, postcode)
       VALUES ($1, $2, $3, $4, $5)`,
      [m.member_id, m.first_name, m.last_name, m.membership_status, m.postcode]
    );
  }
}

export async function getMembers() {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    "SELECT * FROM members ORDER BY last_name ASC, first_name ASC"
  );
  return rows;
}

export async function getMember(id) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM members WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createMember(data) {
  await ensureTable();
  await db.query(
    `INSERT INTO members
       (member_id, first_name, last_name, mobile_no, email, membership_status,
        address_line1, address_line2, city, postcode, county, country, additional_details)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [
      data.memberId,
      data.firstName,
      data.lastName,
      data.mobileNo || null,
      data.email || null,
      data.membershipStatus,
      data.addressLine1 || null,
      data.addressLine2 || null,
      data.city || null,
      data.postcode || null,
      data.county || null,
      data.country || null,
      data.additionalDetails || null,
    ]
  );
}

export async function updateMember(id, data) {
  await ensureTable();
  await db.query(
    `UPDATE members SET
       member_id = $1, first_name = $2, last_name = $3, mobile_no = $4, email = $5,
       membership_status = $6, address_line1 = $7, address_line2 = $8, city = $9,
       postcode = $10, county = $11, country = $12, additional_details = $13, updated_at = now()
     WHERE id = $14`,
    [
      data.memberId,
      data.firstName,
      data.lastName,
      data.mobileNo || null,
      data.email || null,
      data.membershipStatus,
      data.addressLine1 || null,
      data.addressLine2 || null,
      data.city || null,
      data.postcode || null,
      data.county || null,
      data.country || null,
      data.additionalDetails || null,
      id,
    ]
  );
}

export async function deleteMember(id) {
  await ensureTable();
  await db.query("DELETE FROM members WHERE id = $1", [id]);
}

// Public self-service lookup — case-insensitive, whitespace-trimmed match on last name +
// postcode. Deliberately returns only enough to confirm identity and show status (member ID,
// first/last name, status) — never address, email, mobile, or additional details, even to a
// matching requester, since those aren't needed to "verify status."
export async function verifyMembership({ lastName, postcode }) {
  await ensureTable();
  await seedIfEmpty();
  const { rows } = await db.query(
    `SELECT member_id, first_name, last_name, membership_status
     FROM members
     WHERE lower(trim(last_name)) = lower(trim($1))
       AND lower(trim(postcode)) = lower(trim($2))`,
    [lastName, postcode]
  );
  return rows[0] || null;
}
