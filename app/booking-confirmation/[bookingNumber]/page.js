import { notFound } from "next/navigation";
import Logo from "@/components/Logo";
import { getBookingByNumber } from "@/lib/bookings";
import siteConfig from "@/config/site";

export const dynamic = "force-dynamic";

function formatTime(t) {
  return t?.slice(0, 5);
}

export default async function BookingConfirmationPage({ params }) {
  const { bookingNumber } = await params;
  const booking = await getBookingByNumber(bookingNumber);

  if (!booking) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 text-xl font-bold">
            <Logo className="h-7 w-7" />
            {siteConfig.business.name}
          </a>
          <a href="/" className="text-sm font-medium hover:text-muted">
            &larr; Back to home
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold">Thanks, {booking.customer_name.split(" ")[0]}!</h1>
        <p className="mt-2 text-muted">
          Your booking{" "}
          <span className="font-semibold text-foreground">{booking.booking_number}</span> has
          been placed. We&apos;ll be in touch at {booking.customer_email} to confirm.
        </p>

        <div className="mt-8 rounded-xl border border-border p-6 text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">
            Booking details
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Service</span>
              <span className="font-medium text-foreground">{booking.service_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Date</span>
              <span className="font-medium text-foreground">
                {new Date(booking.booking_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Time</span>
              <span className="font-medium text-foreground">
                {formatTime(booking.start_time)}–{formatTime(booking.end_time)}
              </span>
            </div>
          </div>
        </div>

        <a
          href="/"
          className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          Continue browsing
        </a>
      </main>
    </div>
  );
}
