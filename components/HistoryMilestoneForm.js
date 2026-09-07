const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function HistoryMilestoneForm({ action, milestone, submitLabel }) {
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground">Year</label>
        <input
          type="text"
          name="year"
          required
          defaultValue={milestone?.year}
          placeholder="2019"
          className={fieldClass}
        />
        <p className="mt-1 text-xs text-muted">
          Free text — a single year (&quot;2019&quot;) or a short label (&quot;Early
          days&quot;).
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Title</label>
        <input
          type="text"
          name="title"
          required
          defaultValue={milestone?.title}
          placeholder="Founded in a garage"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={milestone?.description}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Display order</label>
        <input
          type="number"
          name="displayOrder"
          defaultValue={milestone?.display_order ?? 0}
          className={fieldClass}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          {submitLabel}
        </button>
        <a
          href="/admin/history-milestones"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
