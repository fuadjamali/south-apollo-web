"use client";

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("south-apollo-theme", isDark ? "dark" : "light");
}

export default function ThemeToggle({ className = "" }) {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:bg-surface-alt ${className}`}
    >
      Theme
    </button>
  );
}
