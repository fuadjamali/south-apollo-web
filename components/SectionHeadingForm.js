"use client";

import { useActionState } from "react";
import { updateSectionHeadingAction } from "@/app/admin/(protected)/section-text/actions";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function SectionHeadingForm({ def, values }) {
  const [state, formAction, pending] = useActionState(updateSectionHeadingAction, {});

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-[140px_1fr_1fr_auto] sm:items-start">
      <input type="hidden" name="key" value={def.key} />
      <p className="pt-2 text-sm font-medium text-foreground">{def.label}</p>
      <div>
        <input
          type="text"
          name="heading"
          required
          defaultValue={values.heading || ""}
          placeholder="Heading"
          className={fieldClass}
        />
        {state?.error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{state.error}</p>}
      </div>
      {def.hasSubheading ? (
        <input
          type="text"
          name="subheading"
          defaultValue={values.subheading || ""}
          placeholder="Subheading (optional)"
          className={fieldClass}
        />
      ) : (
        <div />
      )}
      <div className="flex items-start pt-1">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-alt disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
      <p className="pt-2 text-xs font-medium text-muted" lang="bn">
        বাংলা <span className="font-normal">(optional)</span>
      </p>
      <input
        type="text"
        name="headingBn"
        lang="bn"
        defaultValue={values.translations?.bn?.heading || ""}
        placeholder="বাংলা heading — blank shows English"
        className={fieldClass}
      />
      {def.hasSubheading ? (
        <input
          type="text"
          name="subheadingBn"
          lang="bn"
          defaultValue={values.translations?.bn?.subheading || ""}
          placeholder="বাংলা subheading"
          className={fieldClass}
        />
      ) : (
        <div />
      )}
      <div />
      {state?.success && (
        <p className="sm:col-span-4 text-xs text-green-600 dark:text-green-400">{state.success}</p>
      )}
    </form>
  );
}
