import { notFound } from "next/navigation";
import { getBooking } from "@/lib/bookings";
import DetailField from "@/components/DetailField";
import DeleteButton from "@/components/DeleteButton";
import { updateBookingStatusAction, deleteBookingAction } from "../actions";

export const dynamic = "force-dynamic";

const STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"];

function formatTime(t) {
  return t?.slice(0, 5);
}

export default async function AdminBookingDetailPage({ params }) {
  const { id } = await params;
  const booking = await getBooking(id);

  if (!booking) {
    notFound();
  }

  const boundUpdateStatus = updateBookingStatusAction.bind(null, booking.id);

  return (
    <div className="w-full max-w-2xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">{booking.booking_number}</h1>
          <a href="/admin/bookings" className="text-sm font-medium text-muted hover:underline">
            &larr; Back to bookings
          </a>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Customer</p>
            <p className="mt-1 text-sm text-foreground">
              {booking.customer_name}
              {booking.member_name && (
                <span className="ml-1.5 rounded-full bg-surface-alt px-2 py-0.5 text-xs font-medium">
                  Member account
                </span>
              )}
            </p>
            <p className="text-sm text-muted">{booking.customer_email}</p>
            {booking.customer_phone && (
              <p className="text-sm text-muted">{booking.customer_phone}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Service &amp; time
            </p>
            <p className="mt-1 text-sm text-foreground">{booking.service_name}</p>
            <p className="text-sm text-muted">
              {new Date(booking.booking_date).toLocaleDateString()} ·{" "}
              {formatTime(booking.start_time)}–{formatTime(booking.end_time)}
            </p>
          </div>
        </div>

        <DetailField label="Notes" value={booking.notes} className="mt-4" />

        <form
          action={boundUpdateStatus}
          className="mt-6 flex items-end gap-3 border-t border-border pt-6"
        >
          <div>
            <label className="block text-sm font-medium text-foreground">Status</label>
            <select
              name="status"
              defaultValue={booking.status}
              className="mt-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Update status
          </button>
        </form>

        <form action={deleteBookingAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={booking.id} />
          <DeleteButton
            confirmMessage={`Delete booking ${booking.booking_number}? This can't be undone.`}
            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete this booking
          </DeleteButton>
        </form>
      </div>
    </div>
  );
}
