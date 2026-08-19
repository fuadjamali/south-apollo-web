import { getAllLegalPages } from "@/lib/legalPages";
import LegalPageForm from "@/components/LegalPageForm";

export const dynamic = "force-dynamic";

export default async function AdminLegalPage() {
  const pages = await getAllLegalPages();

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Legal Pages</h1>
        <p className="mt-1 text-sm text-muted">
          Privacy Policy and Terms of Service, each with its own public page.
        </p>

        <div className="mt-6 space-y-8">
          {pages.map((page, i) => (
            <div key={page.slug} className={i > 0 ? "border-t border-border pt-8" : ""}>
              <LegalPageForm page={page} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
