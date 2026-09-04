import {
  getHomeLayout,
  HOME_LAYOUT_SECTIONS,
  ASIDE_CONTENT_OPTIONS,
  DEFAULT_SECTION_ORDER,
} from "@/lib/homeLayout";
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
          Choose how the sections on your home page are arranged — the sections themselves, and
          whether each one is switched on, are unchanged; this only controls their position. Hero
          always stays first and Footer always stays last.
        </p>

        <HomeLayoutForm
          layoutName={layout.layoutName}
          sectionOrder={layout.sectionOrder}
          asidePosition={layout.asidePosition || "right"}
          asideContent={layout.asideContent || "newsEvents"}
          contentWidth={layout.contentWidth || "contained"}
          sections={HOME_LAYOUT_SECTIONS}
          asideContentOptions={ASIDE_CONTENT_OPTIONS}
          defaultSectionOrder={DEFAULT_SECTION_ORDER}
          action={updateHomeLayoutAction}
        />
      </div>
    </div>
  );
}
