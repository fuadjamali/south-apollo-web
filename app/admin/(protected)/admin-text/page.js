import { getAdminText } from "@/lib/adminText";
import AdminTextForm from "@/components/AdminTextForm";

export const dynamic = "force-dynamic";

export default async function AdminAdminTextPage() {
  const adminText = await getAdminText();

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Admin Panel Text</h1>
        <p className="mt-1 text-sm text-muted">
          The heading and subheading shown on this admin panel&apos;s own login and dashboard
          pages — internal tooling text, not shown to visitors of the public site.
        </p>
        <AdminTextForm values={adminText} />
      </div>
    </div>
  );
}
