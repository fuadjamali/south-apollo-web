import { getBranding } from "@/lib/branding";
import BrandingForm from "@/components/BrandingForm";

export const dynamic = "force-dynamic";

export default async function AdminLogoPage() {
  const branding = await getBranding();

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Logo &amp; Icons</h1>
        <p className="mt-1 text-sm text-muted">
          Upload your own logo, browser favicon, and iOS home-screen icon.
        </p>

        <BrandingForm branding={branding} />
      </div>
    </div>
  );
}
