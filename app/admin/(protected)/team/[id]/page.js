import { notFound } from "next/navigation";
import { getTeam } from "@/lib/teams";
import { getTeamMembers } from "@/lib/teamMembers";
import DetailField from "@/components/DetailField";

export const dynamic = "force-dynamic";

export default async function AdminTeamDetailPage({ params }) {
  const { id } = await params;
  const [team, allMembers] = await Promise.all([getTeam(id), getTeamMembers()]);

  if (!team) {
    notFound();
  }

  const members = allMembers.filter((m) => m.team_id === team.id);

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">
            {team.name}
            {team.show_on_home && (
              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
                Home
              </span>
            )}
          </h1>
          <div className="flex gap-2">
            <a
              href={`/admin/team/${team.id}/edit`}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
            >
              Edit
            </a>
            <a
              href="/admin/team"
              className="self-center text-sm font-medium text-muted hover:underline"
            >
              &larr; Back to teams
            </a>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailField label="Display order" value={team.display_order} />
        </div>
        <DetailField label="Description" value={team.description} className="mt-4" />

        <div className="mt-6 border-t border-border pt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Members ({members.length})
          </p>
          {members.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No members in this team yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {members.map((m) => (
                <a
                  key={m.id}
                  href={`/admin/team-members/${m.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-3 text-sm hover:bg-surface-alt"
                >
                  <span className="text-foreground">
                    {m.name} <span className="text-muted">— {m.title || "—"}</span>
                  </span>
                  {!m.active && <span className="text-xs text-muted">Inactive</span>}
                </a>
              ))}
            </div>
          )}
        </div>

        <p className="mt-6 border-t border-border pt-4 text-xs text-muted">
          Added {new Date(team.created_at).toLocaleString()} · Updated{" "}
          {new Date(team.updated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
