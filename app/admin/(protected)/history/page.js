import { getHistoryInfo } from "@/lib/historyInfo";
import { updateHistoryInfoAction } from "./actions";
import { isAIAssistantEnabled } from "@/lib/ai";
import ImageTextSectionForm from "@/components/ImageTextSectionForm";

export const dynamic = "force-dynamic";

export default async function AdminHistoryPage() {
  const [data, aiEnabled] = await Promise.all([getHistoryInfo(), isAIAssistantEnabled()]);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">History section</h1>
        <p className="mt-1 text-sm text-muted">
          Optional home page section — switch it on at Settings → Feature Config. Only shows on
          the live site once there&apos;s a body written below.
        </p>

        <ImageTextSectionForm
          data={data}
          action={updateHistoryInfoAction}
          bodyFieldId="history-body"
          aiEnabled={aiEnabled}
          allowBehindPosition
        />
      </div>
    </div>
  );
}
