import { getMilestones } from "@/lib/historyMilestones";
import { deleteMilestoneAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminHistoryMilestonesPage() {
  const milestones = await getMilestones();

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">History Timeline</h1>
            <p className="mt-1 text-sm text-muted">
              Shown as a vertical timeline in the History section, in this order. Add at least
              one milestone to switch History from plain text to a timeline — the heading and
              intro text at /admin/history still apply above it.
            </p>
          </div>
          <a
            href="/admin/history-milestones/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Add milestone
          </a>
        </div>

        {milestones.length === 0 ? (
          <p className="mt-6 text-sm text-muted">
            No milestones yet — History shows as plain text until you add one.
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground">
                    {milestone.year}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{milestone.title}</p>
                    <p className="text-sm text-muted">
                      {milestone.description || "—"} · order {milestone.display_order}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/history-milestones/${milestone.id}/edit`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    Edit
                  </a>
                  <form action={deleteMilestoneAction}>
                    <input type="hidden" name="id" value={milestone.id} />
                    <DeleteButton
                      confirmMessage={`Delete "${milestone.title}"? This can't be undone.`}
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
