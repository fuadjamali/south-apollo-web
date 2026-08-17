import { notFound } from "next/navigation";
import { getAvailabilityWindow, dayName } from "@/lib/availability";
import AvailabilityWindowForm from "@/components/AvailabilityWindowForm";
import DeleteButton from "@/components/DeleteButton";
import { updateAvailabilityWindowAction, deleteAvailabilityWindowAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditAvailabilityWindowPage({ params }) {
  const { id } = await params;
  const window_ = await getAvailabilityWindow(id);

  if (!window_) {
    notFound();
  }

  const boundUpdate = updateAvailabilityWindowAction.bind(null, window_.id);

  return (
    <div className="w-full max-w-lg px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">
          Edit {dayName(window_.day_of_week)} window
        </h1>
        <AvailabilityWindowForm action={boundUpdate} window={window_} submitLabel="Save changes" />

        <form
          action={deleteAvailabilityWindowAction}
          className="mt-4 border-t border-border pt-4"
        >
          <input type="hidden" name="id" value={window_.id} />
          <DeleteButton
            confirmMessage="Delete this window?"
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this window
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
