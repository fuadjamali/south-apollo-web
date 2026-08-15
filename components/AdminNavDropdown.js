"use client";

import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";

export default function AdminNavDropdown({ label, items }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onBlur={(e) => {
        // Only close once focus has actually left this whole dropdown (button + menu),
        // not when it moves from the button to a link inside the menu.
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-muted hover:bg-surface-alt hover:text-foreground"
      >
        {label}
        <IconChevronDown size={14} className={open ? "rotate-180" : ""} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[190px] rounded-lg border border-border bg-surface py-1 shadow-lg">
          {items.map((child) => (
            <a
              key={child.href}
              href={child.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-muted hover:bg-surface-alt hover:text-foreground"
            >
              {child.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
