import HistoryMilestoneForm from "@/components/HistoryMilestoneForm";
import { createMilestoneAction } from "../actions";

export default function NewHistoryMilestonePage() {
  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add milestone</h1>
        <HistoryMilestoneForm action={createMilestoneAction} submitLabel="Create milestone" />
      </div>
    </div>
  );
}
