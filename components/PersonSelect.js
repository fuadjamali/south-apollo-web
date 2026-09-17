"use client";

import { useEffect, useRef, useState } from "react";
import { IconSearch } from "@tabler/icons-react";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 pl-9 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

// Type-to-search person combobox, no dropdown library — a plain <select> became painful once
// the people directory grows past a handful of names. A hidden input carries the real
// `personId` the form submits, kept in sync with whichever option is clicked, so the
// surrounding Server Action needs no changes to read it (see components/TeamMemberForm.js).
export default function PersonSelect({ name, people, defaultPersonId, required = true }) {
  const initial = people.find((p) => p.id === defaultPersonId);
  const [query, setQuery] = useState(initial?.name || "");
  const [selectedId, setSelectedId] = useState(defaultPersonId || "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered =
    query.trim() === ""
      ? people
      : people.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()));

  function choose(person) {
    setSelectedId(person.id);
    setQuery(person.name);
    setOpen(false);
  }

  function handleChange(e) {
    setQuery(e.target.value);
    setSelectedId("");
    setOpen(true);
  }

  return (
    <div ref={containerRef} className="relative">
      {/* type="hidden" inputs are excluded from HTML5 constraint validation — `required` lives
          on the visible text input instead, which only guarantees non-empty *text*, not a real
          selection. A typed-but-not-chosen value submits as an empty personId, caught
          server-side instead (the action no-ops rather than saving a broken membership). */}
      <input type="hidden" name={name} value={selectedId} />
      <div className="relative">
        <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          required={required}
          placeholder="Type a name…"
          className={fieldClass}
          autoComplete="off"
        />
      </div>
      {open && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-surface shadow-lg">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">
              No match — add them at{" "}
              <a href="/admin/people/new" className="underline">
                /admin/people/new
              </a>{" "}
              first.
            </li>
          ) : (
            filtered.map((person) => (
              <li key={person.id}>
                <button
                  type="button"
                  onClick={() => choose(person)}
                  className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-surface-alt"
                >
                  {person.name}
                  {person.id_no && <span className="ml-2 text-xs text-muted">{person.id_no}</span>}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
