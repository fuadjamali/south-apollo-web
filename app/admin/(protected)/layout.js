"use client";

import { useState } from "react";
import { IconMenu2 } from "@tabler/icons-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import ColorThemeSwitcher from "@/components/ColorThemeSwitcher";
import SignOutButton from "@/components/SignOutButton";
import AdminNavDropdown from "@/components/AdminNavDropdown";
import siteConfig from "@/config/site";

const viewSiteLinkClass =
  "rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-surface-alt";

export default function AdminLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { business, admin } = siteConfig;

  return (
    <div className="flex min-h-screen flex-col bg-surface-alt">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Logo className="h-6 w-6" />
            {business.name}{" "}
            <span className="font-normal text-muted">Admin</span>
          </span>

          {/* Desktop controls — squeezed at narrower widths (same overflow risk the public
              SiteHeader had), so this whole cluster only shows from lg up. */}
          <div className="hidden items-center gap-3 lg:flex">
            <a href="/" target="_blank" rel="noopener noreferrer" className={viewSiteLinkClass}>
              View site
            </a>
            <ColorThemeSwitcher />
            <ThemeToggle />
            <SignOutButton />
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            className="rounded-lg border border-border p-2 lg:hidden"
          >
            <IconMenu2 size={18} />
          </button>
        </div>

        <nav className="mx-auto hidden max-w-6xl flex-wrap items-center gap-x-2 gap-y-2 px-6 pb-4 text-sm font-medium lg:flex">
          {admin.nav.map((item, index) =>
            item.children ? (
              <AdminNavDropdown key={item.label} label={item.label} items={item.children} />
            ) : (
              <a
                key={item.href}
                href={item.href}
                className={
                  index === 0
                    ? "rounded-lg border-b-2 border-primary px-3 py-1.5 pb-1 text-foreground"
                    : "rounded-lg px-3 py-1.5 text-muted hover:bg-surface-alt hover:text-foreground"
                }
              >
                {item.label}
              </a>
            )
          )}
        </nav>

        {menuOpen && (
          <div className="border-t border-border lg:hidden">
            <nav className="flex flex-col gap-1 px-6 py-4 text-sm font-medium">
              {admin.nav.map((item, index) =>
                item.children ? (
                  <div key={item.label} className="mt-3 first:mt-0">
                    <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
                      {item.label}
                    </p>
                    {item.children.map((child) => (
                      <a
                        key={child.href}
                        href={child.href}
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-muted hover:bg-surface-alt hover:text-foreground"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={
                      index === 0
                        ? "rounded-lg bg-surface-alt px-3 py-2 text-foreground"
                        : "rounded-lg px-3 py-2 text-muted hover:bg-surface-alt hover:text-foreground"
                    }
                  >
                    {item.label}
                  </a>
                )
              )}
            </nav>
            <div className="flex flex-wrap items-center gap-2 border-t border-border px-6 py-4">
              <a href="/" target="_blank" rel="noopener noreferrer" className={viewSiteLinkClass}>
                View site
              </a>
              <ColorThemeSwitcher />
              <ThemeToggle />
              <SignOutButton />
            </div>
          </div>
        )}
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        {children}
      </main>
    </div>
  );
}
