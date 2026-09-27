"use client";

import { useActionState } from "react";
import { updateRootAlertAction } from "@/app/admin/(protected)/root-alert/actions";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function RootAlertForm({ enabled, message, messageBn }) {
  const [state, formAction, pending] = useActionState(updateRootAlertAction, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="root-alert-enabled"
          name="enabled"
          defaultChecked={enabled}
          className="h-4 w-4 rounded border-border"
        />
        <label htmlFor="root-alert-enabled" className="text-sm font-medium text-foreground">
          Show the banner
        </label>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Message</label>
        <textarea
          name="message"
          rows={2}
          defaultValue={message}
          placeholder="e.g. This site is under maintenance until Friday."
          className={fieldClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">
          <span lang="bn">বাংলা</span> message{" "}
          <span className="font-normal text-muted">(optional — blank shows the English message)</span>
        </label>
        <textarea name="messageBn" lang="bn" rows={2} defaultValue={messageBn} className={fieldClass} />
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
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
