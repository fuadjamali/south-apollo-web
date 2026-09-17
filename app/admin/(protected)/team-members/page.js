import { getTeamMembers } from "@/lib/teamMembers";
import { getTeams } from "@/lib/teams";
import TeamMembersList from "@/components/TeamMembersList";

export const dynamic = "force-dynamic";

export default async function AdminTeamMembersPage() {
  const [members, teams] = await Promise.all([getTeamMembers(), getTeams()]);

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-foreground">Team members</h1>
          <p className="mt-1 text-sm text-muted">
            Active members appear on the full{" "}
            <a href="/team" className="underline">
              /team
            </a>{" "}
            page; those with &quot;Show on home&quot; also enabled (and whose team has it
            enabled) additionally appear on the home page. People are managed separately at{" "}
            <a href="/admin/people" className="underline">
              /admin/people
            </a>
            .
          </p>
        </div>

        <TeamMembersList members={members} teams={teams} />
      </div>
    </div>
  );
}
