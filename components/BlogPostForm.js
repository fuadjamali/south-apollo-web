import ImageFileInput from "@/components/ImageFileInput";
import AIAssistantButton from "@/components/AIAssistantButton";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

function toDateInputValue(date) {
  if (!date) return "";
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export default function BlogPostForm({ action, post, submitLabel, aiEnabled = false }) {
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground">Title</label>
        <input
          type="text"
          name="title"
          required
          defaultValue={post?.title}
          placeholder="Post title"
          className={fieldClass}
        />
        {post && (
          <p className="mt-1 text-xs text-muted">
            Currently at <code>/blog/{post.slug}</code> — changing the title changes the URL.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Excerpt</label>
        <textarea
          id="blog-excerpt"
          name="excerpt"
          rows={2}
          defaultValue={post?.excerpt}
          placeholder="Short summary shown on the blog list page"
          className={fieldClass}
        />
        {aiEnabled && <AIAssistantButton targetId="blog-excerpt" fieldLabel="blog post excerpt" />}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Body</label>
        <textarea
          id="blog-body"
          name="body"
          rows={8}
          defaultValue={post?.body}
          placeholder="Write the post here. Leave a blank line between paragraphs."
          className={fieldClass}
        />
        {aiEnabled && <AIAssistantButton targetId="blog-body" fieldLabel="blog post body" />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">Published date</label>
          <input
            type="date"
            name="publishedDate"
            defaultValue={toDateInputValue(post?.published_date) || toDateInputValue(new Date())}
            className={fieldClass}
          />
        </div>
      </div>

      <ImageFileInput name="imageFile" label="Cover image" currentImage={post?.image} />

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          {submitLabel}
        </button>
        <a
          href="/admin/blog"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
