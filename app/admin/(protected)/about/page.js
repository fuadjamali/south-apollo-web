import { getAboutInfo } from "@/lib/aboutInfo";
import { updateAboutInfoAction } from "./actions";
import { isAIAssistantEnabled } from "@/lib/ai";
import ImageTextSectionForm from "@/components/ImageTextSectionForm";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const [about, aiEnabled] = await Promise.all([getAboutInfo(), isAIAssistantEnabled()]);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">About Us section</h1>
        <p className="mt-1 text-sm text-muted">
          Shown on the home page. Changes appear on the live site immediately.
        </p>

        <ImageTextSectionForm
          data={about}
          action={updateAboutInfoAction}
          bodyFieldId="about-body"
          aiEnabled={aiEnabled}
          allowBehindPosition
          hidesWhenBodyEmpty={false}
        />
      </div>
    </div>
  );
}
