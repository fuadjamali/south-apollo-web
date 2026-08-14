"use client";

import { useActionState } from "react";
import { changePasswordAction } from "./actions";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function AccountForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground">Current password</label>
        <input
          type="password"
          name="currentPassword"
          required
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">New password</label>
        <input
          type="password"
          name="newPassword"
          required
          minLength={8}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Confirm new password</label>
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={8}
          className={fieldClass}
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-green-600 dark:text-green-400">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        {pending ? "Saving..." : "Change password"}
      </button>
    </form>
  );
}
