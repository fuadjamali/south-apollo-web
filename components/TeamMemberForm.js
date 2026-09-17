import PersonSelect from "@/components/PersonSelect";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

function toDateInputValue(date) {
  if (!date) return "";
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

// Membership admin form — wraps PersonSelect for "who," a plain <select> for "which team," and
// the fields specific to *this* membership (title, dates, flags). Identity fields (name, photo,
// contact) live on the person now (components/PersonForm.js) — this form never edits them.
// `returnTeam` carries the admin list's current ?team= filter through create/edit so the
// post-save redirect lands back on the same filtered view instead of resetting it (see
// components/TeamMembersList.js and app/admin/(protected)/team-members/actions.js).
export default function TeamMemberForm({ action, member, teams, people, returnTeam, submitLabel }) {
  return (
    <form action={action} className="mt-6 space-y-4">
      {returnTeam && <input type="hidden" name="returnTeam" value={returnTeam} />}

      <div>
        <label className="block text-sm font-medium text-foreground">Person</label>
        <PersonSelect name="personId" people={people} defaultPersonId={member?.person_id} />
        {people.length === 0 && (
          <p className="mt-1 text-xs text-muted">
            No one in the directory yet — add someone at{" "}
            <a href="/admin/people/new" className="underline">
              /admin/people/new
            </a>{" "}
            first.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Team</label>
        <select name="teamId" required defaultValue={member?.team_id ?? ""} className={fieldClass}>
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

      <div>
        <label className="block text-sm font-medium text-foreground">Title / role on this team</label>
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
          name="isFormer"
          defaultChecked={member?.is_former ?? false}
          className="h-4 w-4 rounded border-border"
        />
        Former (this person left early — team itself is still current)
      </label>
      <p className="-mt-3 text-xs text-muted">
        Use this only when one person leaves early. If the whole team&apos;s term ended, mark the
        team itself as former instead, at{" "}
        <a href="/admin/team" className="underline">
          /admin/team
        </a>
        .
      </p>

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
          href={returnTeam ? `/admin/team-members?team=${encodeURIComponent(returnTeam)}` : "/admin/team-members"}
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
