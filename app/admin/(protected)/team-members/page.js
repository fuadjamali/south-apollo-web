import { getTeamMembers } from "@/lib/teamMembers";
import { deleteTeamMemberAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminTeamMembersPage() {
  const members = await getTeamMembers();

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Team members</h1>
            <p className="mt-1 text-sm text-muted">
              Shown on the home page&apos;s &quot;Meet our team&quot; section, grouped by team.
              Only active members are shown publicly.
            </p>
          </div>
          <a
            href="/admin/team-members/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Add member
          </a>
        </div>

        {members.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No team members yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {member.name}
                    {!member.active && (
                      <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        Inactive
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted">
                    {member.title || "—"} · {member.team_name || "No team"}
                    {member.id_no ? ` · ${member.id_no}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/team-members/${member.id}/edit`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    Edit
                  </a>
                  <form action={deleteTeamMemberAction}>
                    <input type="hidden" name="id" value={member.id} />
                    <DeleteButton
                      confirmMessage={`Delete "${member.name}"? This can't be undone.`}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-surface-alt dark:text-red-400"
                    />
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
