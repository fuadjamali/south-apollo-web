import PartnerForm from "@/components/PartnerForm";
import { createPartnerAction } from "../actions";

export default function NewPartnerPage() {
  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add partner</h1>
        <PartnerForm action={createPartnerAction} submitLabel="Create partner" />
      </div>
    </div>
  );
}
