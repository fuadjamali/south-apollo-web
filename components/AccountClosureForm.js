"use client";

import { useActionState } from "react";
import { requestAccountClosureAction } from "@/app/member/(protected)/account/actions";

export default function AccountClosureForm() {
  const [state, formAction, pending] = useActionState(requestAccountClosureAction, {});

  if (state?.success) {
    return <p className="mt-3 text-sm text-foreground">{state.success}</p>;
  }

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <textarea
        name="reason"
        rows={2}
        placeholder="Let us know why (optional) — this helps, but isn't required."
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none"
      />
      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        onClick={(e) => {
          if (!window.confirm("Request account closure? An admin will review before anything is closed.")) {
            e.preventDefault();
          }
        }}
        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        {pending ? "Sending..." : "Request account closure"}
      </button>
    </form>
  );
}
