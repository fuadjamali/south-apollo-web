import Logo from "@/components/Logo";
import { getLegalPage } from "@/lib/legalPages";
import { getBusinessInfo } from "@/lib/businessInfo";

// Shared by app/privacy-policy/page.js and app/terms-of-service/page.js — same header/footer
// shell as every other simple public page (e.g. leave-a-review), just parameterized by slug.
export default async function LegalPageView({ slug }) {
  const [page, business] = await Promise.all([getLegalPage(slug), getBusinessInfo()]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 whitespace-nowrap text-xl font-bold">
            <Logo className="h-7 w-7" />
            {business.name}
          </a>
          <a href="/" className="text-sm font-medium hover:text-muted">
            &larr; Back to home
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        {page?.enabled ? (
          <>
            <h1 className="text-3xl font-bold">{page.title}</h1>
            <p className="mt-2 text-xs text-muted">
              Last updated {new Date(page.updated_at).toLocaleDateString()}
            </p>
            <div className="mt-8 whitespace-pre-line text-muted">{page.body}</div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold">Page not available</h1>
            <p className="mt-2 text-muted">This page hasn&apos;t been published yet.</p>
          </>
        )}
      </main>
    </div>
  );
}
