"use client";

import { useActionState } from "react";
import { updateCookieConsentAction } from "@/app/admin/(protected)/site-text/actions";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function CookieConsentForm({ values }) {
  const [state, formAction, pending] = useActionState(updateCookieConsentAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">Banner message</label>
        <textarea
          name="message"
          required
          rows={3}
          defaultValue={values.cookie_message}
          className={fieldClass}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-foreground">Accept button label</label>
          <input
            type="text"
            name="acceptLabel"
            required
            defaultValue={values.cookie_accept_label}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Decline button label</label>
          <input
            type="text"
            name="declineLabel"
            required
            defaultValue={values.cookie_decline_label}
            className={fieldClass}
          />
        </div>
      </div>
      <fieldset className="space-y-4 rounded-lg border border-border p-4">
        <legend className="px-1 text-sm font-semibold text-foreground" lang="bn">
          বাংলা <span className="font-normal text-muted">(optional — blank fields show the English text)</span>
        </legend>
        <div>
          <label className="text-sm font-medium text-foreground">Banner message</label>
          <textarea
            name="messageBn"
            lang="bn"
            rows={3}
            defaultValue={values.translations?.bn?.cookie_message || ""}
            className={fieldClass}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">Accept button label</label>
            <input
              type="text"
              name="acceptLabelBn"
              lang="bn"
              defaultValue={values.translations?.bn?.cookie_accept_label || ""}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Decline button label</label>
            <input
              type="text"
              name="declineLabelBn"
              lang="bn"
              defaultValue={values.translations?.bn?.cookie_decline_label || ""}
              className={fieldClass}
            />
          </div>
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
