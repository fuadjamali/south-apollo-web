"use client";

import { useActionState, useRef, useEffect } from "react";
import { createAdminNavItemAction } from "@/app/admin/(protected)/admin-nav/actions";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

// kind: "group" (new top-level dropdown) | "link" (new top-level plain link) |
// "child" (new link inside an existing group — needs parentId).
export default function AdminNavAddForm({ kind, parentId, submitLabel }) {
  const [state, formAction, pending] = useActionState(createAdminNavItemAction, {});
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-start gap-2">
      <input type="hidden" name="kind" value={kind} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}

      <div className="min-w-[9rem] flex-1">
        <input type="text" name="label" required placeholder="Label" className={fieldClass} />
      </div>

      {kind !== "group" && (
        <div className="min-w-[10rem] flex-1">
          <input
            type="text"
            name="href"
            required
            placeholder="/admin/something"
            className={fieldClass}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-alt disabled:opacity-50"
      >
        {pending ? "Adding…" : submitLabel}
      </button>

      {state?.error && <p className="w-full text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
