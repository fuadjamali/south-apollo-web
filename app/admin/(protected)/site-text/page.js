import { getSiteText } from "@/lib/siteText";
import CookieConsentForm from "@/components/CookieConsentForm";
import SiteUnavailableForm from "@/components/SiteUnavailableForm";

export const dynamic = "force-dynamic";

export default async function AdminSiteTextPage() {
  const siteText = await getSiteText();

  return (
    <div className="w-full max-w-2xl space-y-6 px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Cookie Consent Banner</h1>
        <p className="mt-1 text-sm text-muted">
          Shown once to each visitor at the bottom of the home page until they accept or decline.
        </p>
        <div className="mt-6">
          <CookieConsentForm values={siteText} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Site Unavailable Page</h1>
        <p className="mt-1 text-sm text-muted">
          Shown for any URL that isn&apos;t a real page on this site (HTTP 401).
        </p>
        <div className="mt-6">
          <SiteUnavailableForm values={siteText} />
        </div>
      </div>
    </div>
  );
}
