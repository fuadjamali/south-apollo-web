import { notFound } from "next/navigation";
import { getMember } from "@/lib/members";
import DetailField from "@/components/DetailField";

export const dynamic = "force-dynamic";

const STATUS_BADGE = {
  Active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  Expired: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  Suspended: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  Closed: "bg-gray-300 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export default async function AdminMemberDetailPage({ params }) {
  const { id } = await params;
  const member = await getMember(id);

  if (!member) {
    notFound();
  }

  const address = [
    member.address_line1,
    member.address_line2,
    member.city,
    member.postcode,
    member.county,
    member.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">
            {member.first_name} {member.last_name}{" "}
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[member.membership_status]}`}
            >
              {member.membership_status}
            </span>
            {member.password_hash && (
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                Login active
              </span>
            )}
          </h1>
          <div className="flex gap-2">
            <a
              href={`/admin/members/${member.id}/edit`}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
            >
              Edit
            </a>
            <a
              href="/admin/members"
              className="self-center text-sm font-medium text-muted hover:underline"
            >
              &larr; Back to members
            </a>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailField label="Member ID" value={member.member_id} />
          <DetailField label="Mobile number" value={member.mobile_no} />
          <DetailField label="Email" value={member.email} />
          <DetailField label="Postcode" value={member.postcode} />
        </div>
        <DetailField label="Address" value={address} className="mt-4" />
        <DetailField label="Additional details" value={member.additional_details} className="mt-4" />
        {member.membership_status === "Closed" && (
          <DetailField
            label="Closure note (internal)"
            value={member.closure_note}
            className="mt-4"
          />
        )}

        <p className="mt-6 border-t border-border pt-4 text-xs text-muted">
          Added {new Date(member.created_at).toLocaleString()} · Updated{" "}
          {new Date(member.updated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
