const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function TeamForm({ action, team, submitLabel }) {
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground">Team name</label>
        <input
          type="text"
          name="name"
          required
          defaultValue={team?.name}
          placeholder="Leadership"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={team?.description}
          placeholder="Short description of this team"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Display order</label>
        <input
          type="number"
          name="displayOrder"
          defaultValue={team?.display_order ?? 0}
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
          href="/admin/team"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
