import { notFound } from "next/navigation";
import { getTeamMember } from "@/lib/teamMembers";
import DetailField from "@/components/DetailField";

export const dynamic = "force-dynamic";

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : null;
}

export default async function AdminTeamMemberDetailPage({ params }) {
  const { id } = await params;
  const member = await getTeamMember(id);

  if (!member) {
    notFound();
  }

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">
            {member.name}
            {!member.active && (
              <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                Inactive
              </span>
            )}
            {(member.is_former || member.team_is_former) && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                Former
              </span>
            )}
            {member.active && !member.is_former && !member.team_is_former && member.show_on_home && (
              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
                Home
              </span>
            )}
          </h1>
          <div className="flex gap-2">
            <a
              href={`/admin/team-members/${member.id}/edit`}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
            >
              Edit
            </a>
            <a
              href="/admin/team-members"
              className="self-center text-sm font-medium text-muted hover:underline"
            >
              &larr; Back to team members
            </a>
          </div>
        </div>

        {member.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photo}
            alt=""
            className="mt-6 h-24 w-24 rounded-full border border-border object-cover"
          />
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailField label="Person" value={member.person_id ? member.name : "— deleted person —"} />
          <DetailField label="Team" value={member.team_name} />
          <DetailField label="Title / role" value={member.title} />
          <DetailField label="ID No" value={member.id_no} />
          <DetailField label="Contact number" value={member.contact_no} />
          <DetailField label="Email" value={member.email} />
          <DetailField label="Service join date" value={formatDate(member.service_join_date)} />
          <DetailField label="Service end date" value={formatDate(member.service_end_date)} />
        </div>

        {member.person_id && (
          <p className="mt-4 text-sm">
            <a href={`/admin/people/${member.person_id}`} className="underline">
              View this person&apos;s full record →
            </a>
          </p>
        )}

        <p className="mt-6 border-t border-border pt-4 text-xs text-muted">
          Added {new Date(member.created_at).toLocaleString()} · Updated{" "}
          {new Date(member.updated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
