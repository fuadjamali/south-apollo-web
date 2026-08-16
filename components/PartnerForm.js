import ImageFileInput from "@/components/ImageFileInput";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

const STATUSES = ["Active", "Inactive"];

function toDateInputValue(date) {
  if (!date) return "";
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export default function PartnerForm({ action, partner, submitLabel }) {
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground">Partner name</label>
        <input
          type="text"
          name="name"
          required
          defaultValue={partner?.name}
          className={fieldClass}
        />
      </div>

      <ImageFileInput
        name="logoFile"
        label="Logo image"
        currentImage={partner?.logo}
        previewClassName="mt-2 h-24 w-24 rounded-lg border border-border object-contain bg-surface-alt p-2"
      />

      <div>
        <label className="block text-sm font-medium text-foreground">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={partner?.description}
          className={fieldClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground">Status</label>
          <select
            name="status"
            required
            defaultValue={partner?.status || "Active"}
            className={fieldClass}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Partnership from</label>
          <input
            type="date"
            name="partnershipFrom"
            defaultValue={toDateInputValue(partner?.partnership_from)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Partnership ended</label>
          <input
            type="date"
            name="partnershipEnded"
            defaultValue={toDateInputValue(partner?.partnership_ended)}
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
          href="/admin/partners"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
