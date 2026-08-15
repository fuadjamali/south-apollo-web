import StatForm from "@/components/StatForm";
import { createStatAction } from "../actions";

export default function NewStatPage() {
  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add stat</h1>
        <StatForm action={createStatAction} submitLabel="Create stat" />
      </div>
    </div>
  );
}
