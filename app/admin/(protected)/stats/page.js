import { getStats } from "@/lib/stats";
import { deleteStatAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminStatsPage() {
  const stats = await getStats();

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Stats</h1>
            <p className="mt-1 text-sm text-muted">
              Shown in the stats strip near the top of the home page. Changes appear on the
              live site immediately.
            </p>
          </div>
          <a
            href="/admin/stats/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Add stat
          </a>
        </div>

        {stats.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No stats yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {stat.value} <span className="font-normal text-muted">— {stat.label}</span>
                  </p>
                  <p className="text-sm text-muted">order {stat.display_order}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/stats/${stat.id}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    View
                  </a>
                  <a
                    href={`/admin/stats/${stat.id}/edit`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    Edit
                  </a>
                  <form action={deleteStatAction}>
                    <input type="hidden" name="id" value={stat.id} />
                    <DeleteButton
                      confirmMessage={`Delete "${stat.value} — ${stat.label}"? This can't be undone.`}
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
