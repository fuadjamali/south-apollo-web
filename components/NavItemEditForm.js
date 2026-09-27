"use client";

import { useActionState } from "react";
import { updateNavItemAction, deleteNavItemAction } from "@/app/admin/(protected)/nav/actions";
import DeleteButton from "@/components/DeleteButton";
import NavDestinationField from "@/components/NavDestinationField";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

// One row's inline edit form. `isGroup` = top-level dropdown header (no href/cta/highlight).
// `isChild` = link inside a group (no cta/highlight, but has href). Otherwise it's a plain
// top-level link (has href, cta, highlight). `status` is "hidden" when this item's destination
// (per lib/navDestinations.js) resolves to a module/section that's currently switched off —
// null when the destination is enabled, or unknown (an external/custom link this admin page
// has no way to check). Order is handled by the drag handle in NavReorderableList, not here.
export default function NavItemEditForm({ item, isGroup, isChild, confirmMessage, status }) {
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
        <div className="min-w-[9rem] flex-1">
          <input
            type="text"
            name="labelBn"
            lang="bn"
            defaultValue={item.translations?.bn?.label || ""}
            placeholder="বাংলা label (optional)"
            title="Shown when a visitor picks বাংলা. Leave blank to show the English label."
            className={fieldClass}
          />
        </div>

        {!isGroup && <NavDestinationField defaultValue={item.href || ""} />}

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

        {status === "hidden" && (
          <p className="w-full text-xs font-medium text-amber-600 dark:text-amber-400">
            ⚠ Points to a section/page that&apos;s currently switched off — this link won&apos;t
            go anywhere live until it&apos;s turned back on.
          </p>
        )}
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
