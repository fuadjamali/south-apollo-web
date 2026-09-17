import { getTeams } from "@/lib/teams";
import { getPeople } from "@/lib/people";
import TeamMemberForm from "@/components/TeamMemberForm";
import { createTeamMemberAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewTeamMemberPage({ searchParams }) {
  const { team } = await searchParams;
  const [teams, people] = await Promise.all([getTeams(), getPeople()]);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add team member</h1>
        {teams.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Create a team first at{" "}
            <a href="/admin/team/new" className="underline">
              /admin/team/new
            </a>
            .
          </p>
        ) : (
          <TeamMemberForm
            action={createTeamMemberAction}
            teams={teams}
            people={people}
            returnTeam={team}
            submitLabel="Create member"
          />
        )}
      </div>
    </div>
  );
}
