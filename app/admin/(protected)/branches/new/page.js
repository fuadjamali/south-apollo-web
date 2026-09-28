import BranchForm from "@/components/BranchForm";
import { createBranchAction } from "../actions";

export default function NewBranchPage() {
  return (
    <div className="w-full max-w-3xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add branch</h1>
        <BranchForm action={createBranchAction} submitLabel="Create branch" />
      </div>
    </div>
  );
}
