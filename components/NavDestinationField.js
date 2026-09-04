"use client";

import { useState } from "react";
import { PAGE_DESTINATIONS, ANCHOR_DESTINATIONS, findDestination } from "@/lib/navDestinations";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

// Replaces a plain "type the URL" text input for every nav item's href — the whole reason a
// typo (`#produtcs`, `/gallry`) used to save silently and just quietly go nowhere, with no
// signal anywhere that anything was wrong. Picking from the known-pages/known-sections list
// (lib/navDestinations.js) makes that mistake impossible for anything it covers; "Custom link"
// is the deliberate escape hatch for anything it doesn't (an external URL, a specific product
// page, etc.) — freeform text is still allowed there, just no longer the default/only option.
export default function NavDestinationField({ defaultValue = "" }) {
  const known = defaultValue ? findDestination(defaultValue) : null;
  const [customMode, setCustomMode] = useState(!!defaultValue && !known);

  if (customMode) {
    return (
      <div className="min-w-[12rem] flex-1">
        <input
          type="text"
          name="href"
          required
          defaultValue={defaultValue}
          placeholder="https://... or /path or #anchor"
          className={fieldClass}
        />
        <button
          type="button"
          onClick={() => setCustomMode(false)}
          className="mt-1 text-xs font-medium text-accent hover:underline"
        >
          Choose from list instead
        </button>
      </div>
    );
  }

  return (
    <div className="min-w-[12rem] flex-1">
      <select
        name="href"
        required
        defaultValue={defaultValue || ""}
        onChange={(e) => {
          if (e.target.value === "__custom__") setCustomMode(true);
        }}
        className={fieldClass}
      >
        <option value="" disabled>
          Select a destination…
        </option>
        <optgroup label="Pages">
          {PAGE_DESTINATIONS.map((d) => (
            <option key={d.href} value={d.href}>
              {d.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="Home page sections">
          {ANCHOR_DESTINATIONS.map((d) => (
            <option key={d.href} value={d.href}>
              {d.label}
            </option>
          ))}
        </optgroup>
        <option value="__custom__">Custom link…</option>
      </select>
    </div>
  );
}
