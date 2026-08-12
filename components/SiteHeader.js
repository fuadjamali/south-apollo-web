"use client";

import { useState } from "react";
import { IconMenu2 } from "@tabler/icons-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import ColorThemeSwitcher from "@/components/ColorThemeSwitcher";
import siteConfig from "@/config/site";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { business, nav } = siteConfig;

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex cursor-pointer items-center gap-2 text-xl font-bold"
        >
          <Logo className="h-7 w-7 text-foreground" />
          {business.name}
        </button>

        <div className="hidden gap-6 text-sm font-medium lg:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap hover:text-muted"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ColorThemeSwitcher className="hidden sm:inline-block" />
          <ThemeToggle className="hidden sm:inline-block" />
          <a
            href="#contact"
            className="hidden whitespace-nowrap rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover lg:inline-block"
          >
            Get in touch
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            className="rounded-lg border border-border p-2 lg:hidden"
          >
            <IconMenu2 size={18} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-border lg:hidden">
          <div className="flex flex-col gap-1 px-6 py-4 text-sm font-medium">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 hover:bg-surface-alt"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 flex items-center gap-2 sm:hidden">
              <ColorThemeSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
