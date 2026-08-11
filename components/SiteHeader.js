"use client";

import { useState } from "react";
import { IconMenu2 } from "@tabler/icons-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import siteConfig from "@/config/site";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { business, nav } = siteConfig;

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="flex items-center gap-2 text-xl font-bold">
          <Logo className="h-7 w-7 text-gray-900 dark:text-white" />
          {business.name}
        </span>

        <div className="hidden gap-8 text-sm font-medium md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-gray-600 dark:hover:text-gray-300"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden sm:inline-block" />
          <a
            href="#contact"
            className="hidden rounded-full bg-gray-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 md:inline-block"
          >
            Get in touch
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            className="rounded-lg border border-gray-300 dark:border-gray-700 p-2 md:hidden"
          >
            <IconMenu2 size={18} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-gray-200 dark:border-gray-800 md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4 text-sm font-medium">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                {item.label}
              </a>
            ))}
            <ThemeToggle className="mt-2 text-left sm:hidden" />
          </div>
        </div>
      )}
    </header>
  );
}
