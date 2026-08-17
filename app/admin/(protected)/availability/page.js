import { getAvailabilityWindows, dayName } from "@/lib/availability";
import { deleteAvailabilityWindowAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

function formatTime(t) {
  return t?.slice(0, 5);
}

export default async function AdminAvailabilityPage() {
  const windows = await getAvailabilityWindows();

  return (
    <div className="w-full max-w-3xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Availability</h1>
            <p className="mt-1 text-sm text-muted">
              Weekly windows customers can book into. One shared calendar covers every service —
              a booked slot blocks that time regardless of which service it was for.
            </p>
          </div>
          <a
            href="/admin/availability/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Add window
          </a>
        </div>

        {windows.length === 0 ? (
          <p className="mt-6 text-sm text-muted">
            No availability set yet — the public booking page won&apos;t show any open slots
            until you add at least one window.
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {windows.map((w) => (
              <div
                key={w.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div>
                  <p className="font-semibold text-foreground">{dayName(w.day_of_week)}</p>
                  <p className="text-sm text-muted">
                    {formatTime(w.start_time)} – {formatTime(w.end_time)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/availability/${w.id}/edit`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    Edit
                  </a>
                  <form action={deleteAvailabilityWindowAction}>
                    <input type="hidden" name="id" value={w.id} />
                    <DeleteButton
                      confirmMessage={`Delete this ${dayName(w.day_of_week)} window?`}
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
