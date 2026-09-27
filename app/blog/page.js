import { getPosts } from "@/lib/blog";
import { getSectionHeadings } from "@/lib/sectionHeadings";
import { buildPageMetadata } from "@/lib/seo";
import { getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/translate";

export const revalidate = 3600;

export async function generateMetadata() {
  const { locale, t } = await getT();
  const headings = await getSectionHeadings(locale);
  return buildPageMetadata({
    title: t("pages.blog"),
    description: headings.blog.subheading,
    path: "/blog",
  });
}

export default async function BlogIndexPage() {
  const { locale, t } = await getT();
  const [headings, posts] = await Promise.all([getSectionHeadings(locale), getPosts()]);
  const { blog } = headings;

  return (
    <div>
      <h1 className="text-3xl font-bold">{blog.heading}</h1>
      <p className="mt-2 text-muted">{blog.subheading}</p>

      {posts.length === 0 ? (
        <p className="mt-10 text-muted">{t("blog.empty")}</p>
      ) : (
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {posts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="overflow-hidden rounded-xl border border-border shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                {post.image && (
                  // Admin-editable image source — plain <img>, same reasoning as products
                  // (next/image would hard-crash on an unconfigured external hostname).
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="p-5">
                <p className="text-xs text-muted">
                  {formatDate(post.published_date, locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <h2 className="mt-1 text-lg font-semibold">{post.title}</h2>
                <p className="mt-1 text-sm text-muted">{post.excerpt}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
