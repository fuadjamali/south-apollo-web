import { notFound } from "next/navigation";
import { getMilestone } from "@/lib/historyMilestones";
import HistoryMilestoneForm from "@/components/HistoryMilestoneForm";
import DeleteButton from "@/components/DeleteButton";
import { updateMilestoneAction, deleteMilestoneAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditHistoryMilestonePage({ params }) {
  const { id } = await params;
  const milestone = await getMilestone(id);

  if (!milestone) {
    notFound();
  }

  const boundUpdate = updateMilestoneAction.bind(null, milestone.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit milestone</h1>
        <HistoryMilestoneForm action={boundUpdate} milestone={milestone} submitLabel="Save changes" />

        <form action={deleteMilestoneAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={milestone.id} />
          <DeleteButton
            confirmMessage={`Delete "${milestone.title}"? This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this milestone
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
