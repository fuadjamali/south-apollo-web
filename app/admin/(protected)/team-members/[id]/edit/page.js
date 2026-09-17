import { notFound } from "next/navigation";
import { getTeamMember } from "@/lib/teamMembers";
import { getTeams } from "@/lib/teams";
import { getPeople } from "@/lib/people";
import TeamMemberForm from "@/components/TeamMemberForm";
import DeleteButton from "@/components/DeleteButton";
import { updateTeamMemberAction, deleteTeamMemberAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditTeamMemberPage({ params, searchParams }) {
  const { id } = await params;
  const { team } = await searchParams;
  const [member, teams, people] = await Promise.all([getTeamMember(id), getTeams(), getPeople()]);

  if (!member) {
    notFound();
  }

  const boundUpdate = updateTeamMemberAction.bind(null, member.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit team member</h1>
        <TeamMemberForm
          action={boundUpdate}
          member={member}
          teams={teams}
          people={people}
          returnTeam={team}
          submitLabel="Save changes"
        />

        <form action={deleteTeamMemberAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={member.id} />
          {team && <input type="hidden" name="returnTeam" value={team} />}
          <DeleteButton
            confirmMessage={`Delete "${member.name}"'s membership on ${member.team_name}? This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this membership
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
