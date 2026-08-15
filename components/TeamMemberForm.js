const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

function toDateInputValue(date) {
  if (!date) return "";
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export default function TeamMemberForm({ action, member, teams, submitLabel }) {
  return (
    <form action={action} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">ID No</label>
          <input
            type="text"
            name="idNo"
            defaultValue={member?.id_no}
            placeholder="EMP-001"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Team</label>
          <select
            name="teamId"
            required
            defaultValue={member?.team_id ?? ""}
            className={fieldClass}
          >
            <option value="" disabled>
              Select a team
            </option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Name</label>
        <input
          type="text"
          name="name"
          required
          defaultValue={member?.name}
          placeholder="Full name"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Title</label>
        <input
          type="text"
          name="title"
          defaultValue={member?.title}
          placeholder="Job title"
          className={fieldClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">Contact number</label>
          <input
            type="text"
            name="contactNo"
            defaultValue={member?.contact_no}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={member?.email}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">Service join date</label>
          <input
            type="date"
            name="serviceJoinDate"
            defaultValue={toDateInputValue(member?.service_join_date)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Service end date</label>
          <input
            type="date"
            name="serviceEndDate"
            defaultValue={toDateInputValue(member?.service_end_date)}
            className={fieldClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          name="active"
          defaultChecked={member?.active ?? true}
          className="h-4 w-4 rounded border-border"
        />
        Active (shown on the /team page)
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          name="showOnHome"
          defaultChecked={member?.show_on_home ?? true}
          className="h-4 w-4 rounded border-border"
        />
        Show on home page
      </label>
      <p className="-mt-3 text-xs text-muted">
        Requires both this and Active, and the parent team&apos;s own &quot;Show on home&quot;.
        Otherwise this member only appears on the full{" "}
        <a href="/team" className="underline">
          /team
        </a>{" "}
        page.
      </p>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          {submitLabel}
        </button>
        <a
          href="/admin/team-members"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
