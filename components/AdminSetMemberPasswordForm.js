"use client";

import { useActionState } from "react";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

function generatePassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, "").slice(0, 12);
}

export default function AdminSetMemberPasswordForm({ action, hasPassword }) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <div>
        <label className="block text-sm font-medium text-foreground">
          {hasPassword ? "Set a new password" : "Set a password (activates their login)"}
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            name="newPassword"
            required
            minLength={8}
            placeholder="At least 8 characters"
            className={fieldClass}
            id="admin-set-member-password"
          />
          <button
            type="button"
            onClick={() => {
              const input = document.getElementById("admin-set-member-password");
              input.value = generatePassword();
            }}
            className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-alt"
          >
            Generate
          </button>
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600 dark:text-green-400">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt disabled:opacity-50"
      >
        {pending ? "Setting..." : hasPassword ? "Reset password" : "Set password"}
      </button>
    </form>
  );
}
