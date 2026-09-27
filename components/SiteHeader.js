"use client";

import { useState } from "react";
import { IconChevronDown, IconMenu2, IconUserCircle } from "@tabler/icons-react";
import Logo from "@/components/Logo";
import { useLogoUrls } from "@/components/LogoContext";
import ThemeToggle from "@/components/ThemeToggle";
import ColorThemeSwitcher from "@/components/ColorThemeSwitcher";
import CartIcon from "@/components/CartIcon";
import SiteNavDropdown from "@/components/SiteNavDropdown";

export default function SiteHeader({
  nav,
  businessName,
  cartEnabled = true,
  membersEnabled = true,
  themesEnabled = true,
  footerEnabled = true,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileGroupOpen, setMobileGroupOpen] = useState(null);
  const navItems = nav || [];
  const { light: logoUrl, dark: logoDarkUrl } = useLogoUrls();
  const hasUploadedLogo = Boolean(logoUrl || logoDarkUrl);
  // Below lg the desktop link row is hidden behind the hamburger; the nav's CTA item (e.g. "Book
  // Now") is surfaced next to it so the primary action stays one tap away on phones.
  const ctaItem = navItems.find((item) => item.cta && item.href);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-4 sm:gap-6 sm:px-6">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap text-xl font-bold"
        >
          <Logo
            className="h-16 w-auto text-foreground max-[359px]:h-12 sm:h-[96px]"
            variant="theme"
            alt={businessName}
          />
          {!hasUploadedLogo && businessName}
        </button>

        <div className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {navItems.map((item) =>
            item.children ? (
              <SiteNavDropdown key={item.label} label={item.label} items={item.children} />
            ) : item.cta ? (
              <a
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full bg-primary px-4 py-1.5 text-primary-foreground hover:bg-primary-hover"
              >
                {item.label}
              </a>
            ) : item.highlight ? (
              <a
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full border border-accent px-4 py-1.5 text-accent hover:bg-accent hover:text-white"
              >
                {item.label}
              </a>
            ) : (
              <a key={item.href} href={item.href} className="whitespace-nowrap hover:text-accent">
                {item.label}
              </a>
            )
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {cartEnabled && <CartIcon />}
          {themesEnabled && <ColorThemeSwitcher className="hidden sm:inline-block" />}
          <ThemeToggle className="hidden sm:inline-block" />
          {membersEnabled && (
            <a
              href="/member/login"
              className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-alt lg:inline-flex"
            >
              <IconUserCircle size={16} />
              Member Login
            </a>
          )}
          {footerEnabled && (
            <a
              href="#contact"
              className="hidden whitespace-nowrap rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover lg:inline-block"
            >
              Get in touch
            </a>
          )}
          {ctaItem && (
            <a
              href={ctaItem.href}
              className="whitespace-nowrap rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover sm:px-4 sm:text-sm lg:hidden"
            >
              {ctaItem.label}
            </a>
          )}
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
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() =>
                      setMobileGroupOpen((current) => (current === item.label ? null : item.label))
                    }
                    aria-expanded={mobileGroupOpen === item.label}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-surface-alt"
                  >
                    {item.label}
                    <IconChevronDown
                      size={16}
                      className={`transition-transform ${mobileGroupOpen === item.label ? "rotate-180" : ""}`}
                    />
                  </button>
                  {mobileGroupOpen === item.label && (
                    <div className="ml-3 flex flex-col gap-1 border-l border-border pl-3">
                      {item.children.map((child) => (
                        <a
                          key={child.href}
                          href={child.href}
                          onClick={() => setMenuOpen(false)}
                          className="rounded-lg px-3 py-2 text-muted hover:bg-surface-alt hover:text-foreground"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={
                    item.cta
                      ? "mt-2 rounded-lg bg-primary px-3 py-2 text-center font-semibold text-primary-foreground hover:bg-primary-hover"
                      : item.highlight
                        ? "rounded-lg border border-accent px-3 py-2 font-semibold text-accent hover:bg-accent hover:text-white"
                        : "rounded-lg px-3 py-2 hover:bg-surface-alt"
                  }
                >
                  {item.label}
                </a>
              )
            )}
            {membersEnabled && (
              <a
                href="/member/login"
                onClick={() => setMenuOpen(false)}
                className="mt-2 flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium hover:bg-surface-alt"
              >
                <IconUserCircle size={16} />
                Member Login
              </a>
            )}

            <div className="mt-2 flex items-center gap-2 sm:hidden">
              {themesEnabled && <ColorThemeSwitcher />}
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
