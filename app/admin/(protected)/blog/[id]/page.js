import { notFound } from "next/navigation";
import { getPostById } from "@/lib/blog";
import DetailField from "@/components/DetailField";

export const dynamic = "force-dynamic";

export default async function AdminBlogDetailPage({ params }) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">{post.title}</h1>
          <div className="flex gap-2">
            <a
              href={`/admin/blog/${post.id}/edit`}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
            >
              Edit
            </a>
            <a
              href="/admin/blog"
              className="self-center text-sm font-medium text-muted hover:underline"
            >
              &larr; Back to blog posts
            </a>
          </div>
        </div>

        {post.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image}
            alt=""
            className="mt-6 h-48 w-full rounded-lg border border-border object-cover"
          />
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailField label="Slug" value={`/blog/${post.slug}`} />
          <DetailField
            label="Published date"
            value={new Date(post.published_date).toLocaleDateString()}
          />
        </div>
        <DetailField label="Excerpt" value={post.excerpt} className="mt-4" />
        <DetailField label="Body" value={post.body} className="mt-4" />

        <p className="mt-6 border-t border-border pt-4 text-xs text-muted">
          Added {new Date(post.created_at).toLocaleString()} · Updated{" "}
          {new Date(post.updated_at).toLocaleString()}
        </p>

        <a
          href={`/blog/${post.slug}`}
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
