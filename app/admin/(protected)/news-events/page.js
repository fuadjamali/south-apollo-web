import { getItems } from "@/lib/newsEvents";
import { deleteItemAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

const TYPE_BADGE = {
  News: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Event: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
};

export default async function AdminNewsEventsPage() {
  const items = await getItems();

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">News &amp; Events</h1>
            <p className="mt-1 text-sm text-muted">
              Shown at /news-events and on the home page. Changes appear on the live site
              immediately.
            </p>
          </div>
          <a
            href="/admin/news-events/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Add item
          </a>
        </div>

        {items.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No news or events yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-4">
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      className="h-14 w-20 rounded-md object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">
                      {item.title}{" "}
                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[item.type]}`}
                      >
                        {item.type}
                      </span>
                    </p>
                    <p className="text-sm text-muted">
                      /news-events/{item.slug} ·{" "}
                      {new Date(item.published_date).toLocaleDateString()}
                      {item.type === "Event" && item.event_date
                        ? ` · Event on ${new Date(item.event_date).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/news-events/${item.id}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    View
                  </a>
                  <a
                    href={`/admin/news-events/${item.id}/edit`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    Edit
                  </a>
                  <form action={deleteItemAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <DeleteButton
                      confirmMessage={`Delete "${item.title}"? This can't be undone.`}
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
