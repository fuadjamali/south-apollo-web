import AvailabilityWindowForm from "@/components/AvailabilityWindowForm";
import { createAvailabilityWindowAction } from "../actions";

export default function NewAvailabilityWindowPage() {
  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add availability window</h1>
        <AvailabilityWindowForm action={createAvailabilityWindowAction} submitLabel="Add window" />
      </div>
    </div>
  );
}
