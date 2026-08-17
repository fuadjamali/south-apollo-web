import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getMember } from "@/lib/members";

const COOKIE_NAME = "member_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

// Deliberately not next-auth: members are a separate account system from admins (see
// lib/members.js), and a second next-auth instance would need its own cookie names
// wired through to avoid colliding with the admin session. A small HMAC-signed cookie is
// simpler and keeps the two systems fully independent. Falls back to NEXTAUTH_SECRET so
// this works without extra setup, but set MEMBER_AUTH_SECRET in production for real
// separation between the two session systems.
function getSecret() {
  const secret = process.env.MEMBER_AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("MEMBER_AUTH_SECRET (or NEXTAUTH_SECRET) is not set.");
  return secret;
}

function sign(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
  return `${data}.${mac}`;
}

function verify(token) {
  const [data, mac] = token.split(".");
  if (!data || !mac) return null;

  const expectedMac = crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
  const macBuf = Buffer.from(mac);
  const expectedBuf = Buffer.from(expectedMac);
  if (macBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(macBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createMemberSession({ id, name, email }) {
  const token = sign({ id, name, email, exp: Date.now() + MAX_AGE_SECONDS * 1000 });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getMemberSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verify(token);
  if (!payload) return null;

  return { id: payload.id, name: payload.name, email: payload.email };
}

export async function clearMemberSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// getMemberSession() only proves who they were AT LOGIN — the signed cookie's name/email are
// frozen at that point, so they don't reflect a later GDPR closure (see lib/members.js's
// closeMemberAccount()). Anywhere a session is used to attach a *new* record (an order, a
// booking, a review) or to prefill/display the member's identity, use this instead — it adds
// one live DB check so a closed account can't keep acting as itself through a still-valid
// cookie. The member-portal protected layout does the equivalent check itself (paired with an
// actual redirect, which a plain session lookup shouldn't trigger), so it doesn't call this.
export async function getActiveMemberSession() {
  const session = await getMemberSession();
  if (!session) return null;

  const member = await getMember(session.id);
  if (!member || member.membership_status === "Closed") return null;

  return session;
}
