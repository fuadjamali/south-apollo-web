import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import ColorThemeSwitcher from "@/components/ColorThemeSwitcher";
import siteConfig from "@/config/site";

export default function SiteUnavailablePage() {
  const { errorCodeLabel, heading, message } = siteConfig.siteUnavailable;

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="fixed right-6 top-6 flex items-center gap-2">
        <ColorThemeSwitcher />
        <ThemeToggle />
      </div>

      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
          <Logo className="mx-auto h-10 w-10 text-muted" />

          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
            {errorCodeLabel}
          </p>
          <h1 className="mt-1 text-xl font-bold text-foreground">{heading}</h1>
          <p className="mt-2 text-sm text-muted">{message}</p>

          <a
            href="/"
            className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Back to home
          </a>
        </div>
      </main>
    </div>
  );
}
