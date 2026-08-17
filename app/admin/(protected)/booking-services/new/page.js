import BookingServiceForm from "@/components/BookingServiceForm";
import { createBookingServiceAction } from "../actions";
import { isAIAssistantEnabled } from "@/lib/ai";

export default async function NewBookingServicePage() {
  const aiEnabled = await isAIAssistantEnabled();

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Add service</h1>
        <BookingServiceForm
          action={createBookingServiceAction}
          submitLabel="Create service"
          aiEnabled={aiEnabled}
        />
      </div>
    </div>
  );
}
