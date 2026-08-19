"use client";

import { useActionState } from "react";
import { updateAdminTextAction } from "@/app/admin/(protected)/admin-text/actions";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function AdminTextForm({ values }) {
  const [state, formAction, pending] = useActionState(updateAdminTextAction, {});

  return (
    <form action={formAction} className="mt-6 space-y-6">
      <div>
        <p className="text-sm font-semibold text-foreground">Login page</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">Heading</label>
            <input
              type="text"
              name="loginHeading"
              required
              defaultValue={values.login_heading}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Subheading</label>
            <input
              type="text"
              name="loginSubheading"
              required
              defaultValue={values.login_subheading}
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <p className="text-sm font-semibold text-foreground">Dashboard page</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">Heading</label>
            <input
              type="text"
              name="dashboardHeading"
              required
              defaultValue={values.dashboard_heading}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Subheading</label>
            <input
              type="text"
              name="dashboardSubheading"
              required
              defaultValue={values.dashboard_subheading}
              className={fieldClass}
            />
          </div>
        </div>
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
