import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import siteConfig from "@/config/site";

export default function SiteUnavailablePage() {
  const { errorCodeLabel, heading, message } = siteConfig.siteUnavailable;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <ThemeToggle className="fixed right-6 top-6" />

      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center shadow-sm">
          <Logo className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-600" />

          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            {errorCodeLabel}
          </p>
          <h1 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{heading}</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>

          <a
            href="/"
            className="mt-6 inline-block rounded-lg bg-gray-900 dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200"
          >
            Back to home
          </a>
        </div>
      </main>
    </div>
  );
}
