import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/blog";
import { getBusinessInfo } from "@/lib/businessInfo";
import { buildPageMetadata } from "@/lib/seo";
import { getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/translate";
import { buildArticleJsonLd } from "@/lib/structuredData";
import { isLegacyPlainTextBody, legacyPlainTextToHtml } from "@/lib/blogBodyFormat";

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return buildPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.image,
    type: "article",
  });
}

export default async function BlogPostPage({ params }) {
  const { locale, t } = await getT();
  const { slug } = await params;
  const [post, business] = await Promise.all([getPostBySlug(slug), getBusinessInfo()]);

  if (!post) {
    notFound();
  }

  // Posts saved before the rich text editor existed have a plain-text body — rendered the same
  // way the page always used to. Posts saved since carry real (already-sanitized, see
  // lib/sanitizeBlogBody.js) HTML from the editor and are rendered as-is.
  const bodyHtml = isLegacyPlainTextBody(post.body)
    ? legacyPlainTextToHtml(post.body)
    : post.body || "";
  const jsonLd = buildArticleJsonLd({ post, business });

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a href="/blog" className="text-sm text-accent hover:underline">
        &larr; {t("blog.back")}
      </a>

      <p className="mt-6 text-xs text-muted">
        {formatDate(post.published_date, locale, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <h1 className="mt-1 text-3xl font-bold">{post.title}</h1>

      {post.image && (
        <div className="relative mt-6 aspect-video overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="blog-rich-content mt-8" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </article>
  );
}
