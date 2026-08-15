const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

const STATUSES = ["Active", "Expired", "Suspended"];

export default function MemberForm({ action, member, submitLabel }) {
  return (
    <form action={action} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">Member ID</label>
          <input
            type="text"
            name="memberId"
            required
            defaultValue={member?.member_id}
            placeholder="MEM-0001"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Membership status</label>
          <select
            name="membershipStatus"
            required
            defaultValue={member?.membership_status || "Active"}
            className={fieldClass}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">First name</label>
          <input
            type="text"
            name="firstName"
            required
            defaultValue={member?.first_name}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Last name</label>
          <input
            type="text"
            name="lastName"
            required
            defaultValue={member?.last_name}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">Mobile number</label>
          <input
            type="text"
            name="mobileNo"
            defaultValue={member?.mobile_no}
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

      <div>
        <label className="block text-sm font-medium text-foreground">Address line 1</label>
        <input
          type="text"
          name="addressLine1"
          defaultValue={member?.address_line1}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Address line 2</label>
        <input
          type="text"
          name="addressLine2"
          defaultValue={member?.address_line2}
          className={fieldClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">City</label>
          <input type="text" name="city" defaultValue={member?.city} className={fieldClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Postcode</label>
          <input
            type="text"
            name="postcode"
            defaultValue={member?.postcode}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">County</label>
          <input type="text" name="county" defaultValue={member?.county} className={fieldClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Country</label>
          <input
            type="text"
            name="country"
            defaultValue={member?.country}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Additional details</label>
        <textarea
          name="additionalDetails"
          rows={3}
          defaultValue={member?.additional_details}
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
          href="/admin/members"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
