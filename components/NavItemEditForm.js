"use client";

import { useActionState } from "react";
import { updateNavItemAction, deleteNavItemAction } from "@/app/admin/(protected)/nav/actions";
import DeleteButton from "@/components/DeleteButton";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

// One row's inline edit form. `isGroup` = top-level dropdown header (no href/cta/highlight).
// `isChild` = link inside a group (no cta/highlight, but has href). Otherwise it's a plain
// top-level link (has href, cta, highlight).
export default function NavItemEditForm({ item, isGroup, isChild, confirmMessage }) {
  const [state, formAction, pending] = useActionState(updateNavItemAction, {});

  return (
    <div className="flex flex-wrap items-start gap-2">
      <form action={formAction} className="flex flex-1 flex-wrap items-start gap-2">
        <input type="hidden" name="id" value={item.id} />
        {isGroup && <input type="hidden" name="isGroup" value="on" />}
        {isChild && <input type="hidden" name="isChild" value="on" />}

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
              placeholder="/page or #anchor"
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

        {!isGroup && !isChild && (
          <label className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <input type="checkbox" name="cta" defaultChecked={item.cta} /> CTA pill
          </label>
        )}
        {!isGroup && !isChild && (
          <label className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <input type="checkbox" name="highlight" defaultChecked={item.highlight} /> Highlight
          </label>
        )}

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

      <form action={deleteNavItemAction}>
        <input type="hidden" name="id" value={item.id} />
        <DeleteButton
          confirmMessage={confirmMessage}
          className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-red-600 hover:bg-surface-alt dark:text-red-400"
        />
      </form>
    </div>
  );
}
