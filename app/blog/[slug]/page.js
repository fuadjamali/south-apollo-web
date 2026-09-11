import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/blog";
import { getBusinessInfo } from "@/lib/businessInfo";
import { buildPageMetadata } from "@/lib/seo";
import { buildArticleJsonLd } from "@/lib/structuredData";

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
  const { slug } = await params;
  const [post, business] = await Promise.all([getPostBySlug(slug), getBusinessInfo()]);

  if (!post) {
    notFound();
  }

  const paragraphs = (post.body || "").split(/\n\s*\n/).filter(Boolean);
  const jsonLd = buildArticleJsonLd({ post, business });

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a href="/blog" className="text-sm text-accent hover:underline">
        &larr; Back to blog
      </a>

      <p className="mt-6 text-xs text-muted">
        {new Date(post.published_date).toLocaleDateString(undefined, {
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

      <div className="mt-8 space-y-4 text-foreground">
        {paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
