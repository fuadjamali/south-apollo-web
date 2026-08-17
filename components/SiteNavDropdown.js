"use client";

import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";

// Hover-to-open on desktop (mouse enter/leave on the whole wrapper, not just the button, so
// moving from the trigger down into the panel doesn't flicker), with click/keyboard support
// too since hover alone isn't reachable by touch or keyboard.
export default function SiteNavDropdown({ label, items }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        // Deliberately only ever opens, never toggles-closed: mouseenter has usually already
        // opened this before a click even registers (the pointer has to hover the button to
        // reach it), so a toggle here would fight the hover state and close on the very click
        // meant to open it. Closing is handled by onMouseLeave/onBlur below, or by clicking a
        // link inside the panel. This also makes the trigger work for touch/keyboard, which
        // never fire hover at all.
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="flex items-center gap-1 whitespace-nowrap py-2 hover:text-accent"
      >
        {label}
        <IconChevronDown
          size={14}
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`absolute left-1/2 top-full z-20 min-w-[200px] -translate-x-1/2 rounded-xl border border-border bg-surface p-2 shadow-xl transition-all duration-150 ${
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
        }`}
      >
        {items.map((child) => (
          <a
            key={child.href}
            href={child.href}
            onClick={() => setOpen(false)}
            className="block whitespace-nowrap rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface-alt hover:text-accent"
          >
            {child.label}
          </a>
        ))}
      </div>
    </div>
  );
}
