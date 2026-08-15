import { NextResponse } from "next/server";
import { verifyMembership } from "@/lib/members";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const lastName = body?.lastName?.toString().trim();
  const postcode = body?.postcode?.toString().trim();

  if (!lastName || !postcode) {
    return NextResponse.json(
      { error: "Last name and postcode are required." },
      { status: 400 }
    );
  }

  const member = await verifyMembership({ lastName, postcode });

  if (!member) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({
    found: true,
    memberId: member.member_id,
    firstName: member.first_name,
    lastName: member.last_name,
    status: member.membership_status,
  });
}
