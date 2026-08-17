import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { db } from "@/lib/db";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function ensureTable() {
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
  // Login credentials live on the same row as the membership record — a member and their
  // login are the same thing here, not two linked-but-separate systems. All nullable:
  // an admin-created record has no password until the member signs up/claims it.
  await db.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);`);
  await db.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);`);
  await db.query(
    `ALTER TABLE members ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;`
  );
  // GDPR account closure — a member requests closure, an admin reviews/discusses it, then
  // closes the account. Closing anonymizes personal fields but keeps the row (and its id) so
  // orders/bookings that reference member_account_id keep a valid, if now-anonymous, link —
  // financial/transactional records aren't erased, just detached from identifying info.
  await db.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS closure_requested_at TIMESTAMPTZ;`);
  await db.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS closure_reason TEXT;`);
  await db.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS closure_note TEXT;`);
  // ensureTable() runs on every request, so this must be idempotent under concurrent calls —
  // unconditionally dropping then re-adding the same-named constraint every time is racy (two
  // concurrent requests can both pass the drop and then collide on the add). Drop the original
  // inline-defined constraint once (a no-op once it's gone), then add a distinctly-named
  // replacement only if it isn't already there — never touched again after that.
  await db.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'members_membership_status_check'
      ) THEN
        ALTER TABLE members DROP CONSTRAINT members_membership_status_check;
      END IF;
    END $$;
  `);
  await db.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'members_membership_status_check_v2'
      ) THEN
        ALTER TABLE members ADD CONSTRAINT members_membership_status_check_v2
          CHECK (membership_status IN ('Active', 'Expired', 'Suspended', 'Closed'));
      END IF;
    END $$;
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

// ---- Member login (same row as the membership record — see the password_hash/reset_token
// columns added in ensureTable above) --------------------------------------------------

export async function getMemberByEmail(email) {
  await ensureTable();
  const { rows } = await db.query("SELECT * FROM members WHERE lower(email) = lower($1)", [
    email.trim(),
  ]);
  return rows[0] || null;
}

function fullName(member) {
  return [member.first_name, member.last_name].filter(Boolean).join(" ");
}

async function nextMemberIdCode() {
  const { rows } = await db.query("SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM members");
  return `MEM-${String(rows[0].next_id).padStart(6, "0")}`;
}

// Signup: if an admin already created a membership record for this email but it has no
// password yet, this "claims" that record (sets the password, keeps its member_id/status/
// history) instead of creating a duplicate. Only creates a brand-new record when no
// membership exists for the email at all.
export async function signUpOrClaimMember({ firstName, lastName, email, password }) {
  await ensureTable();
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await getMemberByEmail(normalizedEmail);
  if (existing) {
    if (existing.password_hash) {
      throw new Error("An account with this email already exists.");
    }
    // Claiming an existing admin-created record — keep its member_id/status, just activate login.
    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      `UPDATE members SET password_hash = $1, updated_at = now() WHERE id = $2
       RETURNING id, member_id, first_name, last_name, email, membership_status`,
      [passwordHash, existing.id]
    );
    return rows[0];
  }

  const memberId = await nextMemberIdCode();
  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await db.query(
    `INSERT INTO members (member_id, first_name, last_name, email, password_hash, membership_status)
     VALUES ($1, $2, $3, $4, $5, 'Active')
     RETURNING id, member_id, first_name, last_name, email, membership_status`,
    [memberId, firstName, lastName, normalizedEmail, passwordHash]
  );
  return rows[0];
}

export async function verifyMemberPassword(email, password) {
  const member = await getMemberByEmail(email);
  if (!member || !member.password_hash) return null;

  const isValid = await bcrypt.compare(password, member.password_hash);
  if (!isValid) return null;

  return {
    id: member.id,
    name: fullName(member),
    email: member.email,
    memberId: member.member_id,
    membershipStatus: member.membership_status,
  };
}

export async function updateMemberPassword(id, newPassword) {
  await ensureTable();
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.query("UPDATE members SET password_hash = $1, updated_at = now() WHERE id = $2", [
    passwordHash,
    id,
  ]);
}

// Same "always succeeds from the caller's point of view" shape as before — the public
// forgot-password form shows the same message whether or not the email matched anything,
// so it can't be used to enumerate registered emails.
export async function createPasswordResetToken(email) {
  await ensureTable();
  const member = await getMemberByEmail(email);
  if (!member || !member.password_hash) return null;

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await db.query("UPDATE members SET reset_token = $1, reset_token_expires = $2 WHERE id = $3", [
    token,
    expires,
    member.id,
  ]);
  return token;
}

// Admin-facing — since no email provider is configured, an admin reads the pending requests
// here and shares the reset link with the member directly.
export async function getPendingPasswordResets() {
  await ensureTable();
  const { rows } = await db.query(
    `SELECT id, first_name, last_name, email, reset_token, reset_token_expires
     FROM members
     WHERE reset_token IS NOT NULL AND reset_token_expires > now()
     ORDER BY reset_token_expires DESC`
  );
  return rows.map((r) => ({ ...r, name: fullName(r) }));
}

export async function resetPasswordWithToken(token, newPassword) {
  await ensureTable();
  const { rows } = await db.query(
    "SELECT id FROM members WHERE reset_token = $1 AND reset_token_expires > now()",
    [token]
  );
  const member = rows[0];
  if (!member) return false;

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.query(
    `UPDATE members
     SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = now()
     WHERE id = $2`,
    [passwordHash, member.id]
  );
  return true;
}

// ---- GDPR account closure -------------------------------------------------------------
// Self-service request, admin-reviewed close — not a one-click self-delete. A member asks,
// an admin can follow up with them directly (phone/email, outside this system) before acting,
// then either closes the account or dismisses the request if the member changes their mind.

export async function requestAccountClosure(id, reason) {
  await ensureTable();
  await db.query(
    `UPDATE members SET closure_requested_at = now(), closure_reason = $1, updated_at = now()
     WHERE id = $2 AND membership_status != 'Closed'`,
    [reason || null, id]
  );
}

export async function getPendingClosureRequests() {
  await ensureTable();
  const { rows } = await db.query(
    `SELECT * FROM members
     WHERE closure_requested_at IS NOT NULL AND membership_status != 'Closed'
     ORDER BY closure_requested_at ASC`
  );
  return rows.map((r) => ({ ...r, name: fullName(r) }));
}

// Member reconsidered, or the admin resolved things another way — clears the request without
// touching anything else about the account.
export async function dismissClosureRequest(id) {
  await ensureTable();
  await db.query(
    `UPDATE members SET closure_requested_at = NULL, closure_reason = NULL, updated_at = now()
     WHERE id = $1`,
    [id]
  );
}

// Anonymizes personal fields and revokes login — deliberately keeps the row (and its id, and
// member_id) so historical orders/bookings still resolve their member_account_id FK, and keeps
// closure_requested_at as an audit trail of when the member asked. adminNote is internal only,
// never shown to the member.
export async function closeMemberAccount(id, adminNote) {
  await ensureTable();
  await db.query(
    `UPDATE members SET
       first_name = 'Former', last_name = 'Member', mobile_no = NULL, email = NULL,
       address_line1 = NULL, address_line2 = NULL, city = NULL, postcode = NULL,
       county = NULL, country = NULL, additional_details = NULL,
       password_hash = NULL, reset_token = NULL, reset_token_expires = NULL,
       membership_status = 'Closed', closure_note = $1, updated_at = now()
     WHERE id = $2`,
    [adminNote || null, id]
  );
}
