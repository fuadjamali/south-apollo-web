import { getBusinessInfo } from "@/lib/businessInfo";
import BusinessInfoForm from "@/components/BusinessInfoForm";

export const dynamic = "force-dynamic";

export default async function AdminBusinessPage() {
  const business = await getBusinessInfo();

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Business info</h1>
        <p className="mt-1 text-sm text-muted">
          Your business name, tagline, and description — used across the site and in search
          results.
        </p>

        <BusinessInfoForm business={business} />
      </div>
    </div>
  );
}
