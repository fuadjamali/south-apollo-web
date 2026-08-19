"use client";

import { useActionState } from "react";
import { updateBusinessInfoAction } from "@/app/admin/(protected)/business/actions";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";
const labelClass = "block text-sm font-medium text-foreground";

export default function BusinessInfoForm({ business }) {
  const [state, formAction, pending] = useActionState(updateBusinessInfoAction, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label className={labelClass}>Business name</label>
        <p className="text-xs text-muted">
          Shown in the header, footer, browser tab title, and search results everywhere on the
          site.
        </p>
        <input
          type="text"
          name="name"
          required
          defaultValue={business.name || ""}
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Tagline</label>
        <p className="text-xs text-muted">Shown next to the business name in search results.</p>
        <input
          type="text"
          name="tagline"
          defaultValue={business.tagline || ""}
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <p className="text-xs text-muted">
          Used for SEO and social-share previews (Open Graph / Twitter cards).
        </p>
        <textarea
          name="description"
          rows={3}
          defaultValue={business.description || ""}
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Domain</label>
        <p className="text-xs text-muted">
          No https:// or trailing slash — used for the canonical URL in social-share previews.
        </p>
        <input
          type="text"
          name="domain"
          defaultValue={business.domain || ""}
          placeholder="example.com"
          className={fieldClass}
        />
      </div>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600 dark:text-green-400">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
