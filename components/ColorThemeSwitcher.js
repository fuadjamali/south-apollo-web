"use client";

import { useEffect, useRef } from "react";
import { useT } from "@/components/LocaleContext";

// Labels live in the i18n dictionaries as colorTheme.<id>.
const COLOR_THEMES = ["ocean", "forest", "desert", "royal", "ferrari", "golden", "burgundy", "onyx-gold"];

function applyColorTheme(id) {
  document.documentElement.setAttribute("data-theme", id);
  localStorage.setItem("south-apollo-color-theme", id);
}

export default function ColorThemeSwitcher({ className = "" }) {
  const t = useT();
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
      aria-label={t("colorTheme.label")}
      className={`rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt focus:outline-none ${className}`}
    >
      {COLOR_THEMES.map((id) => (
        <option key={id} value={id}>
          {t(`colorTheme.${id}`)}
        </option>
      ))}
    </select>
  );
}
