"use client";

import { Children, useRef, useState, useTransition } from "react";
import { IconGripVertical, IconChevronUp, IconChevronDown } from "@tabler/icons-react";

// Drag-and-drop reorder wrapper for one sibling group of nav items (top-level items, or one
// group's children — page.js renders one of these per group). `items` is plain data (each needs
// an `.id` and `.label`); `children` must be the matching pre-rendered JSX for each item, in the
// same order — a render-prop function can't cross the server→client boundary from page.js (a
// Server Component) the way pre-rendered elements can, so this takes rendered nodes instead of
// a callback that builds them.
//
// Two ways to move a row, same pattern as components/HomeLayoutForm.js: drag by the handle, or
// the up/down buttons (a keyboard/touch-a11y fallback drag-and-drop alone doesn't give you).
// Every move calls `reorderAction` immediately — no separate "Save order" step, no page reload,
// so a drop just takes effect, the same way dragging a card on a kanban board does.
export default function NavReorderableList({ items, parentId, reorderAction, children }) {
  const nodeList = Children.toArray(children);
  const [order, setOrder] = useState(items.map((item) => item.id));
  const [isPending, startTransition] = useTransition();
  const dragIndex = useRef(null);

  const entryById = {};
  items.forEach((item, i) => {
    entryById[item.id] = { item, node: nodeList[i] };
  });

  function persist(nextOrder) {
    setOrder(nextOrder);
    startTransition(() => {
      reorderAction(parentId, nextOrder);
    });
  }

  function moveTo(from, to) {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    persist(next);
  }

  function handleDrop(dropIndex) {
    if (dragIndex.current === null || dragIndex.current === dropIndex) return;
    moveTo(dragIndex.current, dropIndex);
    dragIndex.current = null;
  }

  return (
    <div className={`space-y-3 transition-opacity ${isPending ? "opacity-60" : ""}`}>
      {order.map((id, index) => {
        const entry = entryById[id];
        if (!entry) return null;
        return (
          <div
            key={id}
            draggable
            onDragStart={() => {
              dragIndex.current = index;
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
            className="flex items-start gap-2"
          >
            <div className="flex shrink-0 flex-col items-center gap-0.5 pt-2.5 text-muted">
              <IconGripVertical size={15} className="cursor-grab" aria-hidden />
              <button
                type="button"
                onClick={() => moveTo(index, index - 1)}
                disabled={index === 0}
                aria-label={`Move ${entry.item.label} up`}
                className="rounded p-0.5 hover:bg-surface-alt hover:text-foreground disabled:opacity-30"
              >
                <IconChevronUp size={13} />
              </button>
              <button
                type="button"
                onClick={() => moveTo(index, index + 1)}
                disabled={index === order.length - 1}
                aria-label={`Move ${entry.item.label} down`}
                className="rounded p-0.5 hover:bg-surface-alt hover:text-foreground disabled:opacity-30"
              >
                <IconChevronDown size={13} />
              </button>
            </div>
            <div className="min-w-0 flex-1">{entry.node}</div>
          </div>
        );
      })}
    </div>
  );
}
