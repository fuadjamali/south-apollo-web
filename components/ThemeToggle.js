"use client";

import { useT } from "@/components/LocaleContext";

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("south-apollo-theme", isDark ? "dark" : "light");
}

// Labeled with the mode it switches TO ("Dark" while light, "Light" while dark). Both labels are
// rendered and swapped by the `dark:` variant, so the right one shows from first paint — the mode
// is only known client-side (ThemeScript), and a state-driven label would mismatch on hydration.
export default function ThemeToggle({ className = "" }) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:bg-surface-alt ${className}`}
    >
      <span className="dark:hidden">{t("theme.toDark")}</span>
      <span className="hidden dark:inline">{t("theme.toLight")}</span>
    </button>
  );
}
