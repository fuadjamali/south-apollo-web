"use client";

import { useActionState } from "react";
import { updateLegalPageAction } from "@/app/admin/(protected)/legal/actions";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";
const labelClass = "block text-sm font-medium text-foreground";

export default function LegalPageForm({ page }) {
  const [state, formAction, pending] = useActionState(updateLegalPageAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="slug" value={page.slug} />

      <div>
        <label className={labelClass}>Title</label>
        <input
          type="text"
          name="title"
          required
          defaultValue={page.title || ""}
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Content</label>
        <textarea
          name="body"
          rows={10}
          defaultValue={page.body || ""}
          className={`${fieldClass} font-mono text-xs`}
        />
        <p className="mt-1 text-xs text-muted">
          Plain text — blank lines become paragraph breaks on the public page.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={page.enabled}
          className="h-4 w-4 rounded border-border"
        />
        Publish this page at /{page.slug}
      </label>
      {!page.enabled && (
        <p className="text-xs text-muted">
          Off by default — visiting /{page.slug} shows a &quot;not published yet&quot; message
          until you turn this on.
        </p>
      )}

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
