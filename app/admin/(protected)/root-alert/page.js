import { getRootAlert } from "@/lib/rootAlert";
import RootAlertForm from "@/components/RootAlertForm";

export const dynamic = "force-dynamic";

export default async function AdminRootAlertPage() {
  const rootAlert = await getRootAlert();

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Root Alert</h1>
        <p className="mt-1 text-sm text-muted">
          A banner shown at the very top of every page on the site, above the header. Use it for
          a site-wide notice — or turn it off entirely.
        </p>
        <RootAlertForm
          enabled={rootAlert.enabled}
          message={rootAlert.message}
          messageBn={rootAlert.translations?.bn?.message || ""}
        />
      </div>
    </div>
  );
}
