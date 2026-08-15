import { notFound } from "next/navigation";
import { getTeam } from "@/lib/teams";
import TeamForm from "@/components/TeamForm";
import DeleteButton from "@/components/DeleteButton";
import { updateTeamAction, deleteTeamAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditTeamPage({ params }) {
  const { id } = await params;
  const team = await getTeam(id);

  if (!team) {
    notFound();
  }

  const boundUpdate = updateTeamAction.bind(null, team.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit team</h1>
        <TeamForm action={boundUpdate} team={team} submitLabel="Save changes" />

        <form action={deleteTeamAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={team.id} />
          <DeleteButton
            confirmMessage={`Delete "${team.name}"? This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this team
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
