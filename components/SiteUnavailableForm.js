"use client";

import { useActionState } from "react";
import { updateSiteUnavailableAction } from "@/app/admin/(protected)/site-text/actions";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function SiteUnavailableForm({ values }) {
  const [state, formAction, pending] = useActionState(updateSiteUnavailableAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">Error code label</label>
        <input
          type="text"
          name="errorCodeLabel"
          required
          defaultValue={values.unavailable_error_code_label}
          className={fieldClass}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Heading</label>
        <input
          type="text"
          name="heading"
          required
          defaultValue={values.unavailable_heading}
          className={fieldClass}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Message</label>
        <textarea
          name="message"
          required
          rows={2}
          defaultValue={values.unavailable_message}
          className={fieldClass}
        />
      </div>
      <fieldset className="space-y-4 rounded-lg border border-border p-4">
        <legend className="px-1 text-sm font-semibold text-foreground" lang="bn">
          বাংলা <span className="font-normal text-muted">(optional — blank fields show the English text)</span>
        </legend>
        <div>
          <label className="text-sm font-medium text-foreground">Error code label</label>
          <input
            type="text"
            name="errorCodeLabelBn"
            lang="bn"
            defaultValue={values.translations?.bn?.unavailable_error_code_label || ""}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Heading</label>
          <input
            type="text"
            name="headingBn"
            lang="bn"
            defaultValue={values.translations?.bn?.unavailable_heading || ""}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Message</label>
          <textarea
            name="messageBn"
            lang="bn"
            rows={2}
            defaultValue={values.translations?.bn?.unavailable_message || ""}
            className={fieldClass}
          />
        </div>
      </fieldset>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {state?.success && <p className="text-xs text-green-600 dark:text-green-400">{state.success}</p>}
        {state?.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
      </div>
    </form>
  );
}
