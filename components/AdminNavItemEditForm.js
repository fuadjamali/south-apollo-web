"use client";

import { useActionState } from "react";
import {
  updateAdminNavItemAction,
  deleteAdminNavItemAction,
} from "@/app/admin/(protected)/admin-nav/actions";
import DeleteButton from "@/components/DeleteButton";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

// isGroup = top-level dropdown header (no href). Otherwise it's a link (top-level or child),
// both need an href — AdminHeader.js doesn't support cta/highlight on admin nav items.
export default function AdminNavItemEditForm({ item, isGroup, confirmMessage }) {
  const [state, formAction, pending] = useActionState(updateAdminNavItemAction, {});

  return (
    <div className="flex flex-wrap items-start gap-2">
      <form action={formAction} className="flex flex-1 flex-wrap items-start gap-2">
        <input type="hidden" name="id" value={item.id} />
        {isGroup && <input type="hidden" name="isGroup" value="on" />}

        <div className="min-w-[9rem] flex-1">
          <input
            type="text"
            name="label"
            required
            defaultValue={item.label}
            placeholder="Label"
            className={fieldClass}
          />
        </div>

        {!isGroup && (
          <div className="min-w-[10rem] flex-1">
            <input
              type="text"
              name="href"
              required
              defaultValue={item.href || ""}
              placeholder="/admin/something"
              className={fieldClass}
            />
          </div>
        )}

        <div className="w-20">
          <input
            type="number"
            name="displayOrder"
            defaultValue={item.display_order}
            className={fieldClass}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-alt disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>

        {state?.error && (
          <p className="w-full text-xs text-red-600 dark:text-red-400">{state.error}</p>
        )}
      </form>

      <form action={deleteAdminNavItemAction}>
        <input type="hidden" name="id" value={item.id} />
        <DeleteButton
          confirmMessage={confirmMessage}
          className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-red-600 hover:bg-surface-alt dark:text-red-400"
        />
      </form>
    </div>
  );
}
