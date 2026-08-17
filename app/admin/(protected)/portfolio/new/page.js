import PortfolioItemForm from "@/components/PortfolioItemForm";
import { createPortfolioItemAction } from "../actions";
import { isAIAssistantEnabled } from "@/lib/ai";

export default async function NewPortfolioItemPage() {
  const aiEnabled = await isAIAssistantEnabled();

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add portfolio project</h1>
        <PortfolioItemForm
          action={createPortfolioItemAction}
          submitLabel="Create project"
          aiEnabled={aiEnabled}
        />
      </div>
    </div>
  );
}
