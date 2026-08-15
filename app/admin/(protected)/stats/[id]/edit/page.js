import { notFound } from "next/navigation";
import { getStat } from "@/lib/stats";
import StatForm from "@/components/StatForm";
import DeleteButton from "@/components/DeleteButton";
import { updateStatAction, deleteStatAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditStatPage({ params }) {
  const { id } = await params;
  const stat = await getStat(id);

  if (!stat) {
    notFound();
  }

  const boundUpdate = updateStatAction.bind(null, stat.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit stat</h1>
        <StatForm action={boundUpdate} stat={stat} submitLabel="Save changes" />

        <form action={deleteStatAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={stat.id} />
          <DeleteButton
            confirmMessage={`Delete "${stat.value} — ${stat.label}"? This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this stat
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
