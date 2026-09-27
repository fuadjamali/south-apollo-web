"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleContext";
import { LOCALES, LOCALE_COOKIE, LOCALE_LABELS } from "@/lib/i18n/config";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function persistLocale(next) {
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
  document.documentElement.lang = next;
}

// Segmented EN | বাংলা control. Choosing writes the cookie lib/i18n/server.js reads, then
// re-renders the current page on the server in the new language (no URL change).
// `className` owns the display value (default inline-flex) so callers can hide it responsively
// without two conflicting display utilities on one element.
export default function LanguageSwitcher({ className = "inline-flex" }) {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next) {
    if (next === locale) return;
    persistLocale(next);
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label="Language / ভাষা"
      className={`rounded-full border border-border p-0.5 text-sm font-medium ${
        pending ? "opacity-60" : ""
      } ${className}`}
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          onClick={() => choose(code)}
          aria-pressed={code === locale}
          className={`rounded-full px-2.5 py-1 leading-none ${
            code === locale ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-surface-alt"
          }`}
        >
          {LOCALE_LABELS[code]}
        </button>
      ))}
    </div>
  );
}
