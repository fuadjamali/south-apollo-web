import { getTeams } from "@/lib/teams";
import { getTeamMembers } from "@/lib/teamMembers";
import { deleteTeamAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const [teams, members] = await Promise.all([getTeams(), getTeamMembers()]);

  const memberCounts = members.reduce((acc, m) => {
    if (m.team_id) acc[m.team_id] = (acc[m.team_id] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Teams</h1>
            <p className="mt-1 text-sm text-muted">
              Teams with &quot;Show on home&quot; enabled appear in the home page&apos;s
              &quot;Meet our team&quot; section; every team appears on the full{" "}
              <a href="/team" className="underline">
                /team
              </a>{" "}
              page. Manage members at{" "}
              <a href="/admin/team-members" className="underline">
                Team Members
              </a>
              .
            </p>
          </div>
          <a
            href="/admin/team/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Add team
          </a>
        </div>

        {teams.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No teams yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {teams.map((team) => {
              const count = memberCounts[team.id] || 0;
              return (
                <div
                  key={team.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {team.name}
                      {team.show_on_home && (
                        <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
                          Home
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted">
                      {count} {count === 1 ? "member" : "members"} · order {team.display_order}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`/admin/team/${team.id}/edit`}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                    >
                      Edit
                    </a>
                    <form action={deleteTeamAction}>
                      <input type="hidden" name="id" value={team.id} />
                      <DeleteButton
                        confirmMessage={
                          count > 0
                            ? `Delete "${team.name}"? This will also delete its ${count} team member(s). This can't be undone.`
                            : `Delete "${team.name}"? This can't be undone.`
                        }
                        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-surface-alt dark:text-red-400"
                      />
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
