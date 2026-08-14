import { getPosts } from "@/lib/blog";
import { deletePostAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await getPosts();

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Blog posts</h1>
            <p className="mt-1 text-sm text-muted">
              Shown at /blog. Changes appear on the live site immediately.
            </p>
          </div>
          <a
            href="/admin/blog/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Add post
          </a>
        </div>

        {posts.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No posts yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-4">
                  {post.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.image}
                      alt=""
                      className="h-14 w-20 rounded-md object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">{post.title}</p>
                    <p className="text-sm text-muted">
                      /blog/{post.slug} ·{" "}
                      {new Date(post.published_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    View
                  </a>
                  <a
                    href={`/admin/blog/${post.id}/edit`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    Edit
                  </a>
                  <form action={deletePostAction}>
                    <input type="hidden" name="id" value={post.id} />
                    <DeleteButton
                      confirmMessage={`Delete "${post.title}"? This can't be undone.`}
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
