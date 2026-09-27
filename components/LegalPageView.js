import Logo from "@/components/Logo";
import { getLegalPage } from "@/lib/legalPages";
import { getBusinessInfo } from "@/lib/businessInfo";
import { getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/translate";

// Shared by app/privacy-policy/page.js and app/terms-of-service/page.js — same header/footer
// shell as every other simple public page (e.g. leave-a-review), just parameterized by slug.
export default async function LegalPageView({ slug }) {
  const [page, business, { locale, t }] = await Promise.all([
    getLegalPage(slug),
    getBusinessInfo(),
    getT(),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 whitespace-nowrap text-xl font-bold">
            <Logo className="h-7 w-7" />
            {business.name}
          </a>
          <a href="/" className="text-sm font-medium hover:text-muted">
            &larr; {t("common.backToHome")}
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        {page?.enabled ? (
          <>
            <h1 className="text-3xl font-bold">{page.title}</h1>
            <p className="mt-2 text-xs text-muted">
              {t("legal.lastUpdated", {
                date: formatDate(page.updated_at, locale, { year: "numeric", month: "long", day: "numeric" }),
              })}
            </p>
            <div className="mt-8 whitespace-pre-line text-muted">{page.body}</div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold">{t("legal.unavailableTitle")}</h1>
            <p className="mt-2 text-muted">{t("legal.unavailableBody")}</p>
          </>
        )}
      </main>
    </div>
  );
}
