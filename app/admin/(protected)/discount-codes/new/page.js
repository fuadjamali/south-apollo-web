import DiscountCodeForm from "@/components/DiscountCodeForm";
import { createDiscountCodeAction } from "../actions";

export default function NewDiscountCodePage() {
  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add discount code</h1>
        <DiscountCodeForm action={createDiscountCodeAction} submitLabel="Create code" />
      </div>
    </div>
  );
}
