"use client";

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("falcon-theme", isDark ? "dark" : "light");
}

export default function ThemeToggle({ className = "" }) {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`rounded-full border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 ${className}`}
    >
      Theme
    </button>
  );
}
