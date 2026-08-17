const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

function toDateInputValue(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function DiscountCodeForm({ action, discountCode, submitLabel }) {
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground">Code</label>
        <input
          type="text"
          name="code"
          required
          defaultValue={discountCode?.code}
          placeholder="WELCOME10"
          className={`${fieldClass} uppercase`}
        />
        <p className="mt-1 text-xs text-muted">Not case-sensitive at checkout.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">Type</label>
          <select
            name="type"
            defaultValue={discountCode?.type ?? "percentage"}
            className={fieldClass}
          >
            <option value="percentage">Percentage off</option>
            <option value="fixed">Fixed amount off</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Value</label>
          <input
            type="number"
            name="value"
            required
            min="0.01"
            step="0.01"
            defaultValue={discountCode?.value}
            placeholder="10"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">
            Expires (optional)
          </label>
          <input
            type="date"
            name="expiresAt"
            defaultValue={toDateInputValue(discountCode?.expires_at)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">
            Usage limit (optional)
          </label>
          <input
            type="number"
            name="usageLimit"
            min="1"
            defaultValue={discountCode?.usage_limit ?? ""}
            placeholder="Unlimited"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="discount-code-active"
          name="active"
          defaultChecked={discountCode?.active ?? true}
          className="h-4 w-4 rounded border-border"
        />
        <label htmlFor="discount-code-active" className="text-sm font-medium text-foreground">
          Active
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          {submitLabel}
        </button>
        <a
          href="/admin/discount-codes"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
