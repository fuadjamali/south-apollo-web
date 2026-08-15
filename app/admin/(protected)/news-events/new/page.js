import NewsEventForm from "@/components/NewsEventForm";
import { createItemAction } from "../actions";

export default function NewNewsEventPage() {
  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add news / event</h1>
        <NewsEventForm action={createItemAction} submitLabel="Create" />
      </div>
    </div>
  );
}
