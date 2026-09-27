import { getItems } from "@/lib/newsEvents";
import { getSectionHeadings } from "@/lib/sectionHeadings";
import { buildPageMetadata } from "@/lib/seo";
import { getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/translate";

export const revalidate = 3600;

export async function generateMetadata() {
  const { locale, t } = await getT();
  const headings = await getSectionHeadings(locale);
  return buildPageMetadata({
    title: t("pages.newsEvents"),
    description: headings.newsEvents.subheading,
    path: "/news-events",
  });
}

const TYPE_BADGE = {
  News: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Event: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
};

export default async function NewsEventsIndexPage() {
  const { locale, t } = await getT();
  const [headings, items] = await Promise.all([getSectionHeadings(locale), getItems()]);
  const { newsEvents } = headings;

  return (
    <div>
      <h1 className="text-3xl font-bold">{newsEvents.heading}</h1>
      <p className="mt-2 text-muted">{newsEvents.subheading}</p>

      {items.length === 0 ? (
        <p className="mt-10 text-muted">{t("newsEvents.empty")}</p>
      ) : (
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {items.map((item) => (
            <a
              key={item.slug}
              href={`/news-events/${item.slug}`}
              className="overflow-hidden rounded-xl border border-border shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                {item.image && (
                  // Admin-editable image source — plain <img>, same reasoning as blog/products.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${TYPE_BADGE[item.type]}`}
                  >
                    {t(`newsEvents.type.${item.type}`)}
                  </span>
                  <span>
                    {formatDate(item.published_date, locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm text-muted">{item.summary}</p>
                {item.type === "Event" && item.event_date && (
                  <p className="mt-2 text-xs font-medium text-foreground">
                    {t("newsEvents.eventDate")}{" "}
                    {formatDate(item.event_date, locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {item.event_location ? ` · ${item.event_location}` : ""}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
