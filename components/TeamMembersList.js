"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { deleteTeamMemberAction } from "@/app/admin/(protected)/team-members/actions";
import DeleteButton from "@/components/DeleteButton";

// Admin list — the filter lives in the URL (?team=), not useState. Picking a team from the
// dropdown, clicking Add member, saving, and landing back on the *unfiltered* list is exactly
// the bug a plain useState filter produces — a full-page navigation (the redirect after a
// Server Action) resets component state. Keeping it in the query string instead survives that
// round trip, and every link on the page (Add/View/Edit/Delete) carries it forward via
// `withFilter`/the hidden `returnTeam` field so the post-save redirect lands back here.
export default function TeamMembersList({ members, teams }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamFilter = searchParams.get("team") || "all";
  const error = searchParams.get("error");

  function handleFilterChange(value) {
    const query = value === "all" ? "" : `?team=${encodeURIComponent(value)}`;
    router.replace(`/admin/team-members${query}`);
  }

  function withFilter(href) {
    return teamFilter === "all" ? href : `${href}${href.includes("?") ? "&" : "?"}team=${encodeURIComponent(teamFilter)}`;
  }

  const visibleMembers =
    teamFilter === "all" ? members : members.filter((m) => String(m.team_id) === teamFilter);

  return (
    <div>
      {error === "duplicate" && (
        <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
          That person already has an active membership on that team — pick a different person or
          team, or edit the existing membership instead.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <label className="text-sm font-medium text-foreground">Filter by team</label>
          <select
            value={teamFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="mt-1 block rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            <option value="all">All teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <a
          href={withFilter("/admin/team-members/new")}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          Add member
        </a>
      </div>

      {visibleMembers.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No team members match this filter.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {visibleMembers.map((member) => (
            <div
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
            >
              <div className="flex items-center gap-3">
                {member.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
                )}
                <div>
                  <p className="font-semibold text-foreground">
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
                  </p>
                  <p className="text-sm text-muted">
                    {member.title || "—"} · {member.team_name || "No team"}
                    {member.id_no ? ` · ${member.id_no}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={withFilter(`/admin/team-members/${member.id}`)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                >
                  View
                </a>
                <a
                  href={withFilter(`/admin/team-members/${member.id}/edit`)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                >
                  Edit
                </a>
                <form action={deleteTeamMemberAction}>
                  <input type="hidden" name="id" value={member.id} />
                  {teamFilter !== "all" && <input type="hidden" name="returnTeam" value={teamFilter} />}
                  <DeleteButton
                    confirmMessage={`Delete "${member.name}"'s membership on ${member.team_name}? This can't be undone.`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-surface-alt dark:text-red-400"
                  />
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
