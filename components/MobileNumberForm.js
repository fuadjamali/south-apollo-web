"use client";

import { useActionState } from "react";
import { updateMobileAction } from "@/app/admin/(protected)/subscription/actions";

export default function MobileNumberForm({ mobileNo }) {
  const [state, formAction, pending] = useActionState(updateMobileAction, {});

  return (
    <form action={formAction} className="mt-1">
      <div className="flex gap-2">
        <input
          type="tel"
          name="mobileNo"
          defaultValue={mobileNo}
          placeholder="Add a mobile number"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save"}
        </button>
      </div>
      {state?.error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">{state.success}</p>
      )}
    </form>
  );
}
