import { getBookings } from "@/lib/bookings";

export const dynamic = "force-dynamic";

const STATUS_BADGE = {
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  Confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  Cancelled: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

function formatTime(t) {
  return t?.slice(0, 5);
}

export default async function AdminBookingsPage() {
  const bookings = await getBookings();

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Bookings</h1>
        <p className="mt-1 text-sm text-muted">
          Placed via the site&apos;s /booking page. Manage services at{" "}
          <a href="/admin/booking-services" className="text-accent hover:underline">
            Booking services
          </a>{" "}
          and weekly hours at{" "}
          <a href="/admin/availability" className="text-accent hover:underline">
            Availability
          </a>
          .
        </p>

        {bookings.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No bookings yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {bookings.map((booking) => (
              <a
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4 hover:bg-surface-alt"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {booking.booking_number}{" "}
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[booking.status]}`}
                    >
                      {booking.status}
                    </span>
                  </p>
                  <p className="text-sm text-muted">
                    {booking.customer_name}
                    {booking.member_name && (
                      <span className="ml-1.5 rounded-full bg-surface-alt px-2 py-0.5 text-xs font-medium">
                        Member
                      </span>
                    )}{" "}
                    · {booking.service_name}
                  </p>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(booking.booking_date)} · {formatTime(booking.start_time)}–
                  {formatTime(booking.end_time)}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
