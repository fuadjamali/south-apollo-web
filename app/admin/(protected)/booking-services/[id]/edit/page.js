import { notFound } from "next/navigation";
import { getBookingService } from "@/lib/bookingServices";
import BookingServiceForm from "@/components/BookingServiceForm";
import DeleteButton from "@/components/DeleteButton";
import { updateBookingServiceAction, deleteBookingServiceAction } from "../../actions";
import { isModuleEnabled } from "@/lib/plan";

export const dynamic = "force-dynamic";

export default async function EditBookingServicePage({ params }) {
  const { id } = await params;
  const service = await getBookingService(id);

  if (!service) {
    notFound();
  }

  const boundUpdate = updateBookingServiceAction.bind(null, service.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Edit service</h1>
        <BookingServiceForm
          action={boundUpdate}
          service={service}
          submitLabel="Save changes"
          aiEnabled={isModuleEnabled("ai")}
        />

        <form action={deleteBookingServiceAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={service.id} />
          <DeleteButton
            confirmMessage={`Delete "${service.name}"? This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this service
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
