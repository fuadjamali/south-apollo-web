import { notFound } from "next/navigation";
import { getItemById } from "@/lib/newsEvents";
import DetailField from "@/components/DetailField";

export const dynamic = "force-dynamic";

const TYPE_BADGE = {
  News: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Event: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
};

export default async function AdminNewsEventDetailPage({ params }) {
  const { id } = await params;
  const item = await getItemById(id);

  if (!item) {
    notFound();
  }

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">
            {item.title}{" "}
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[item.type]}`}
            >
              {item.type}
            </span>
          </h1>
          <div className="flex gap-2">
            <a
              href={`/admin/news-events/${item.id}/edit`}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
            >
              Edit
            </a>
            <a
              href="/admin/news-events"
              className="self-center text-sm font-medium text-muted hover:underline"
            >
              &larr; Back to news &amp; events
            </a>
          </div>
        </div>

        {item.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt=""
            className="mt-6 h-48 w-full rounded-lg border border-border object-cover"
          />
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailField label="Slug" value={`/news-events/${item.slug}`} />
          <DetailField
            label="Published date"
            value={new Date(item.published_date).toLocaleDateString()}
          />
          {item.type === "Event" && (
            <>
              <DetailField
                label="Event date"
                value={item.event_date ? new Date(item.event_date).toLocaleDateString() : null}
              />
              <DetailField label="Event location" value={item.event_location} />
            </>
          )}
        </div>
        <DetailField label="Summary" value={item.summary} className="mt-4" />
        <DetailField label="Description" value={item.description} className="mt-4" />

        <p className="mt-6 border-t border-border pt-4 text-xs text-muted">
          Added {new Date(item.created_at).toLocaleString()} · Updated{" "}
          {new Date(item.updated_at).toLocaleString()}
        </p>

        <a
          href={`/news-events/${item.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-accent hover:underline"
        >
          View on site &rarr;
        </a>
      </div>
    </div>
  );
}
