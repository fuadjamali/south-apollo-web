"use client";

import { useActionState, useRef, useState } from "react";
import { IconGripVertical, IconChevronUp, IconChevronDown } from "@tabler/icons-react";

// Reorder UI for /admin/home-layout. Two ways to move a row, both driving the same array: drag
// by the handle (native HTML5 drag-and-drop, no library — this list only ever has ~18 rows, so
// the O(n) reorder-on-drop is trivial), or the up/down buttons, which work the same without a
// pointer (keyboard/touch-a11y fallback that drag-and-drop alone doesn't give you).
export default function HomeLayoutForm({ layoutName, sectionOrder, sections, action }) {
  const [state, formAction, pending] = useActionState(action, {});
  const [mode, setMode] = useState(layoutName); // "default" | "custom"
  const [order, setOrder] = useState(sectionOrder);
  const dragIndex = useRef(null);
  const formRef = useRef(null);

  const labelByKey = Object.fromEntries(sections.map((s) => [s.key, s.label]));

  function moveTo(from, to) {
    if (to < 0 || to >= order.length) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function handleDrop(dropIndex) {
    if (dragIndex.current === null || dragIndex.current === dropIndex) return;
    moveTo(dragIndex.current, dropIndex);
    dragIndex.current = null;
  }

  return (
    <form ref={formRef} action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="layoutName" value={mode} />
      <input type="hidden" name="sectionOrder" value={JSON.stringify(order)} />

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="radio"
            checked={mode === "default"}
            onChange={() => setMode("default")}
            className="h-4 w-4 border-border"
          />
          Default layout
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="radio"
            checked={mode === "custom"}
            onChange={() => setMode("custom")}
            className="h-4 w-4 border-border"
          />
          Custom layout
        </label>
      </div>

      {mode === "default" ? (
        <p className="rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm text-muted">
          Sections will show in their original order. Switch to Custom to rearrange them.
        </p>
      ) : (
        <ol className="divide-y divide-border rounded-lg border border-border">
          {order.map((key, index) => (
            <li
              key={key}
              draggable
              onDragStart={() => {
                dragIndex.current = index;
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className="flex items-center gap-3 bg-surface px-4 py-2.5"
            >
              <IconGripVertical size={16} className="shrink-0 cursor-grab text-muted" aria-hidden />
              <span className="flex-1 text-sm text-foreground">{labelByKey[key] || key}</span>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => moveTo(index, index - 1)}
                  disabled={index === 0}
                  aria-label={`Move ${labelByKey[key] || key} up`}
                  className="rounded-md border border-border p-1 text-foreground hover:bg-surface-alt disabled:opacity-30"
                >
                  <IconChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveTo(index, index + 1)}
                  disabled={index === order.length - 1}
                  aria-label={`Move ${labelByKey[key] || key} down`}
                  className="rounded-md border border-border p-1 text-foreground hover:bg-surface-alt disabled:opacity-30"
                >
                  <IconChevronDown size={14} />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600 dark:text-green-400">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
