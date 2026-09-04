"use client";

import { useActionState, useRef, useState } from "react";
import { IconGripVertical, IconChevronUp, IconChevronDown } from "@tabler/icons-react";

// Small wireframe diagram of a layout mode, purely illustrative (not to scale, no real data) —
// the point is letting a non-technical admin/client see the shape of "sidebar, left" vs
// "sidebar, right" vs the plain stack at a glance, without needing to preview the live site.
// `aside` is null for the single-column Default/Custom shape, or "left"/"right" for the Sidebar
// shape; `fill` draws the bars flush to the diagram's own edges instead of leaving a margin,
// mirroring what the Fill toggle does to the real page.
function LayoutDiagram({ aside, fill, className = "" }) {
  const bar = "fill-border";
  const accent = "fill-accent";
  const dark = "fill-gray-700 dark:fill-gray-500";
  const edge = fill ? 0 : 4;
  const w = 100 - edge * 2;

  if (!aside) {
    return (
      <svg viewBox="0 0 100 130" className={className} aria-hidden>
        <rect x={edge} y="4" width={w} height="18" rx="3" className={accent} />
        {[26, 40, 54, 68, 82, 96].map((y) => (
          <rect key={y} x={edge} y={y} width={w} height="10" rx="2" className={bar} />
        ))}
        <rect x={edge} y="112" width={w} height="14" rx="3" className={dark} />
      </svg>
    );
  }

  const asideW = 26;
  const gap = fill ? 4 : 6;
  const asideX = aside === "left" ? edge : 100 - edge - asideW;
  const mainX = aside === "left" ? edge + asideW + gap : edge;
  const mainW = w - asideW - gap;

  return (
    <svg viewBox="0 0 100 130" className={className} aria-hidden>
      <rect x={edge} y="4" width={w} height="18" rx="3" className={accent} />
      <rect x={asideX} y="26" width={asideW} height="86" rx="3" className={accent} opacity="0.55" />
      {[26, 44, 62, 80, 98].map((y) => (
        <rect key={y} x={mainX} y={y} width={mainW} height="12" rx="2" className={bar} />
      ))}
      <rect x={edge} y="112" width={w} height="14" rx="3" className={dark} />
    </svg>
  );
}

const MODES = [
  { key: "default", title: "Default", blurb: "Original order, single column.", aside: null },
  { key: "custom", title: "Custom", blurb: "Reorder every section yourself.", aside: null },
  {
    key: "sidebar",
    title: "Sidebar Layout",
    blurb: "A feed in an aside next to everything else.",
    aside: "right",
  },
];

// Reorder UI for /admin/home-layout. Two ways to move a row, both driving the same array: drag
// by the handle (native HTML5 drag-and-drop, no library — this list only ever has ~18 rows, so
// the O(n) reorder-on-drop is trivial), or the up/down buttons, which work the same without a
// pointer (keyboard/touch-a11y fallback that drag-and-drop alone doesn't give you).
//
// Custom and Sidebar each keep their own independent order array in state (customOrder /
// sidebarOrder) rather than one shared array, since Sidebar's list is one section shorter
// (whichever section is feeding the aside isn't in the reorderable main column) — switching
// between modes never has to reconcile two different-shaped arrays against each other, each
// just remembers its own last arrangement.
export default function HomeLayoutForm({
  layoutName,
  sectionOrder,
  asidePosition,
  asideContent,
  contentWidth,
  sections,
  asideContentOptions,
  defaultSectionOrder,
  action,
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [mode, setMode] = useState(layoutName);
  const [customOrder, setCustomOrder] = useState(
    layoutName === "custom" ? sectionOrder : defaultSectionOrder
  );
  const initialContent = asideContent?.length ? asideContent : ["newsEvents"];
  const [sidebarOrder, setSidebarOrder] = useState(
    layoutName === "sidebar"
      ? sectionOrder
      : defaultSectionOrder.filter((k) => !initialContent.includes(k))
  );
  const [aside, setAside] = useState(asidePosition || "right");
  const [content, setContent] = useState(initialContent);
  const [fill, setFill] = useState(contentWidth === "fill");
  const dragIndex = useRef(null);

  const labelByKey = Object.fromEntries(sections.map((s) => [s.key, s.label]));
  const order = mode === "sidebar" ? sidebarOrder : customOrder;
  const setOrder = mode === "sidebar" ? setSidebarOrder : setCustomOrder;

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

  // Toggling one aside-content checkbox: recompute the main-column list from scratch against
  // the new set of excluded keys — drop any that just got pinned to the aside, add back (in
  // default relative position) any that just got un-pinned — rather than resetting the whole
  // order, so ticking Blog on alongside News & Events doesn't throw away a custom arrangement
  // of everything else. At least one content type must stay selected, so unticking the last one
  // is a no-op rather than leaving the aside empty.
  function toggleAsideContent(key) {
    setContent((prevContent) => {
      const isSelected = prevContent.includes(key);
      if (isSelected && prevContent.length === 1) return prevContent;
      const nextContent = isSelected
        ? prevContent.filter((k) => k !== key)
        : [...prevContent, key];
      setSidebarOrder((prevOrder) => {
        const withoutExcluded = prevOrder.filter((k) => !nextContent.includes(k));
        const missing = defaultSectionOrder.filter(
          (k) => !nextContent.includes(k) && !withoutExcluded.includes(k)
        );
        return [...withoutExcluded, ...missing];
      });
      return nextContent;
    });
  }

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <input type="hidden" name="layoutName" value={mode} />
      <input type="hidden" name="sectionOrder" value={JSON.stringify(order)} />
      <input type="hidden" name="asidePosition" value={aside} />
      <input type="hidden" name="asideContent" value={JSON.stringify(content)} />
      <input type="hidden" name="contentWidth" value={fill ? "fill" : "contained"} />

      <div className="grid gap-3 sm:grid-cols-3">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={`rounded-lg border p-3 text-left transition ${
              mode === m.key
                ? "border-primary ring-1 ring-primary"
                : "border-border hover:border-accent"
            }`}
          >
            <LayoutDiagram
              aside={m.key === "sidebar" ? (mode === "sidebar" ? aside : m.aside) : null}
              fill={m.key === "sidebar" && mode === "sidebar" ? fill : false}
              className="h-20 w-full"
            />
            <p className="mt-2 text-sm font-semibold text-foreground">{m.title}</p>
            <p className="mt-0.5 text-xs text-muted">{m.blurb}</p>
          </button>
        ))}
      </div>

      {mode === "default" && (
        <p className="rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm text-muted">
          Sections will show in their original order. Pick Custom or Sidebar Layout to change
          that.
        </p>
      )}

      {mode === "sidebar" && (
        <div className="space-y-4 rounded-lg border border-border bg-surface-alt p-4">
          <div>
            <span className="block text-sm font-medium text-foreground">Aside content</span>
            <div className="mt-1 flex flex-wrap gap-4">
              {asideContentOptions.map((opt) => (
                <label key={opt.key} className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={content.includes(opt.key)}
                    onChange={() => toggleAsideContent(opt.key)}
                    className="h-4 w-4 rounded border-border"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted">
              Pick one or more — each becomes its own stacked card in the sidebar, and drops out
              of the reorderable list below. At least one must stay selected.
            </p>
          </div>

          <div>
            <span className="block text-sm font-medium text-foreground">Sidebar position</span>
            <div className="mt-1 flex gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="radio"
                  checked={aside === "left"}
                  onChange={() => setAside("left")}
                  className="h-4 w-4 border-border"
                />
                Left
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="radio"
                  checked={aside === "right"}
                  onChange={() => setAside("right")}
                  className="h-4 w-4 border-border"
                />
                Right
              </label>
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-medium text-foreground">Fill browser width</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {fill
                    ? "On — no side margin, the sidebar sits flush against the browser edge."
                    : "Off — centered with a margin, capped at 1980px wide."}
                </span>
              </span>
              <span
                role="switch"
                aria-checked={fill}
                onClick={() => setFill((v) => !v)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                  fill ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    fill ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </span>
            </label>
          </div>
        </div>
      )}

      {(mode === "custom" || mode === "sidebar") && (
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
