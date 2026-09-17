"use client";

import { useRef } from "react";
import ImageFileInput from "@/components/ImageFileInput";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

// Person admin form — name, photo, id number, contact number, email. Nothing team-specific
// lives here at all; this page would be identical on a site with no concept of teams, just a
// people directory (see components/TeamMemberForm.js / PersonSelect.js for where a person gets
// assigned to a team). `existingNames` excludes the person currently being edited, so saving
// someone unchanged never warns against themselves.
export default function PersonForm({ action, person, existingNames = [], submitLabel }) {
  const formRef = useRef(null);

  function handleSubmit(e) {
    const name = e.currentTarget.elements.name.value.trim().toLowerCase();
    const isDuplicate = existingNames.some((n) => n.trim().toLowerCase() === name);
    if (isDuplicate) {
      const proceed = window.confirm(
        `A person named "${e.currentTarget.elements.name.value.trim()}" already exists. Create another anyway?`
      );
      if (!proceed) e.preventDefault();
    }
  }

  return (
    <form ref={formRef} action={action} onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground">Name</label>
        <input
          type="text"
          name="name"
          required
          defaultValue={person?.name}
          placeholder="Full name"
          className={fieldClass}
        />
      </div>

      <ImageFileInput
        name="photoFile"
        label="Photo"
        currentImage={person?.photo}
        previewClassName="mt-2 h-24 w-24 rounded-full border border-border object-cover"
      />

      <div>
        <label className="block text-sm font-medium text-foreground">ID No</label>
        <input
          type="text"
          name="idNo"
          defaultValue={person?.id_no}
          placeholder="EMP-001"
          className={fieldClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">Contact number</label>
          <input type="text" name="contactNo" defaultValue={person?.contact_no} className={fieldClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Email</label>
          <input type="email" name="email" defaultValue={person?.email} className={fieldClass} />
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
          href="/admin/people"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
