"use client";

import { useEffect, useRef } from "react";

const COLOR_THEMES = [
  { id: "ocean", label: "Ocean Blue" },
  { id: "forest", label: "Forest Green" },
  { id: "desert", label: "Desert Orange" },
  { id: "royal", label: "Royal Purple" },
  { id: "ferrari", label: "Ferrari Red" },
  { id: "golden", label: "Golden" },
];

function applyColorTheme(id) {
  document.documentElement.setAttribute("data-theme", id);
  localStorage.setItem("falcon-color-theme", id);
}

export default function ColorThemeSwitcher({ className = "" }) {
  const selectRef = useRef(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") || "ocean";
    if (selectRef.current) selectRef.current.value = current;
  }, []);

  return (
    <select
      ref={selectRef}
      defaultValue="ocean"
      onChange={(e) => applyColorTheme(e.target.value)}
      aria-label="Color theme"
      className={`rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt focus:outline-none ${className}`}
    >
      {COLOR_THEMES.map((theme) => (
        <option key={theme.id} value={theme.id}>
          {theme.label}
        </option>
      ))}
    </select>
  );
}
