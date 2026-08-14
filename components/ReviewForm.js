const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function ReviewForm({ action, review, submitLabel }) {
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground">Platform name</label>
        <input
          type="text"
          name="platformName"
          required
          defaultValue={review?.platform_name}
          placeholder="Trustpilot"
          className={fieldClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">Rating</label>
          <input
            type="text"
            name="rating"
            defaultValue={review?.rating}
            placeholder="4.8"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Review count</label>
          <input
            type="text"
            name="reviewCount"
            defaultValue={review?.review_count}
            placeholder="120 reviews"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Link to platform</label>
        <input
          type="text"
          name="url"
          defaultValue={review?.url}
          placeholder="https://www.trustpilot.com/review/yourdomain.com"
          className={fieldClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">Logo path or URL</label>
          <input
            type="text"
            name="logo"
            defaultValue={review?.logo}
            placeholder="/logos/trustpilot.svg"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Display order</label>
          <input
            type="number"
            name="displayOrder"
            defaultValue={review?.display_order ?? 0}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          {submitLabel}
        </button>
        <a
          href="/admin/reviews"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
