import { getHomeLayout, HOME_LAYOUT_SECTIONS } from "@/lib/homeLayout";
import { updateHomeLayoutAction } from "./actions";
import HomeLayoutForm from "@/components/HomeLayoutForm";

export const dynamic = "force-dynamic";

export default async function AdminHomeLayoutPage() {
  const layout = await getHomeLayout();

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Home Page Layout</h1>
        <p className="mt-1 text-sm text-muted">
          Reorder the sections on your home page — the sections themselves, and whether each one
          is switched on, are unchanged; this only controls the order they appear in. Hero always
          stays first and Footer always stays last.
        </p>

        <HomeLayoutForm
          layoutName={layout.layoutName}
          sectionOrder={layout.sectionOrder}
          sections={HOME_LAYOUT_SECTIONS}
          action={updateHomeLayoutAction}
        />
      </div>
    </div>
  );
}
