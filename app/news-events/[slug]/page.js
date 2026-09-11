import { notFound } from "next/navigation";
import { getItemBySlug } from "@/lib/newsEvents";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 3600;

const TYPE_BADGE = {
  News: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Event: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = await getItemBySlug(slug);
  if (!item) return {};
  return buildPageMetadata({
    title: item.title,
    description: item.summary,
    path: `/news-events/${item.slug}`,
    image: item.image,
    type: item.type === "Event" ? "website" : "article",
  });
}

export default async function NewsEventDetailPage({ params }) {
  const { slug } = await params;
  const item = await getItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const paragraphs = (item.description || "").split(/\n\s*\n/).filter(Boolean);

  return (
    <article>
      <a href="/news-events" className="text-sm text-accent hover:underline">
        &larr; Back to News &amp; Events
      </a>

      <div className="mt-6 flex items-center gap-2 text-xs text-muted">
        <span className={`rounded-full px-2 py-0.5 font-medium ${TYPE_BADGE[item.type]}`}>
          {item.type}
        </span>
        <span>
          {new Date(item.published_date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>
      <h1 className="mt-1 text-3xl font-bold">{item.title}</h1>

      {item.type === "Event" && (item.event_date || item.event_location) && (
        <p className="mt-3 rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm font-medium text-foreground">
          {item.event_date &&
            new Date(item.event_date).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          {item.event_date && item.event_location ? " · " : ""}
          {item.event_location}
        </p>
      )}

      {item.image && (
        <div className="relative mt-6 aspect-video overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="mt-8 space-y-4 text-foreground">
        {paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
