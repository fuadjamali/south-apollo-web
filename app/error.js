"use client";

import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { useT } from "@/components/LocaleContext";

export default function GlobalError({ reset }) {
  const t = useT();
  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="fixed right-6 top-6 flex items-center gap-2">
        <ThemeToggle />
      </div>

      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
          <Logo className="mx-auto h-10 w-10 text-muted" />

          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
            {t("error.label")}
          </p>
          <h1 className="mt-1 text-xl font-bold text-foreground">{t("error.title")}</h1>
          <p className="mt-2 text-sm text-muted">
            {t("error.body")}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
            >
              {t("error.retry")}
            </button>
            <a
              href="/"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              {t("common.backToHome")}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
