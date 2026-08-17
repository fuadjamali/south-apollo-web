"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "@/app/member/actions";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function MemberForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, {});

  if (state?.success) {
    return (
      <p className="mt-6 rounded-lg border border-border bg-surface-alt p-4 text-sm text-foreground">
        {state.success}
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground">Email</label>
        <input type="email" name="email" required className={fieldClass} />
      </div>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        {pending ? "Sending..." : "Request reset link"}
      </button>
    </form>
  );
}
