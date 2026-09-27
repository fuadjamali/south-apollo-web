"use client";

import { useActionState } from "react";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";
const labelClass = "block text-sm font-medium text-foreground";

export default function DoctorSpecialtyForm({ action, specialty, submitLabel }) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Name (English)</label>
          <input type="text" name="nameEn" required defaultValue={specialty?.name_en} placeholder="Cardiology" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Name (বাংলা)</label>
          <input type="text" name="nameBn" defaultValue={specialty?.name_bn || ""} placeholder="হৃদরোগ" className={fieldClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Symptoms &amp; diseases (English)</label>
          <textarea
            name="keywordsEn"
            rows={10}
            defaultValue={specialty?.keywords_en || ""}
            placeholder={"chest pain\npalpitation\nblood pressure"}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Symptoms &amp; diseases (বাংলা)</label>
          <textarea
            name="keywordsBn"
            rows={10}
            defaultValue={specialty?.keywords_bn || ""}
            placeholder={"বুকে ব্যথা\nবুক ধড়ফড়\nপ্রেসার"}
            className={fieldClass}
          />
        </div>
      </div>
      <p className="text-xs text-muted">
        One per line, the way patients say it. When a visitor types any of these on the Find a Doctor
        page, this specialty is suggested and its doctors are shown — in either language.
      </p>

      <div className="max-w-xs">
        <label className={labelClass}>Display order</label>
        <input type="number" name="displayOrder" defaultValue={specialty?.display_order ?? 0} className={fieldClass} />
      </div>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <a
          href="/admin/doctors/specialties"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
