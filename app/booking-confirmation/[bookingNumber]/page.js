import { notFound } from "next/navigation";
import Logo from "@/components/Logo";
import { getBookingByNumber } from "@/lib/bookings";
import { getBusinessInfo } from "@/lib/businessInfo";
import { buildPageMetadata } from "@/lib/seo";
import { getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/translate";

export const dynamic = "force-dynamic";

// noIndex: a real customer's booking details behind a guessable-ish URL — never appropriate to
// surface in search results.
export async function generateMetadata() {
  const { t } = await getT();
  return buildPageMetadata({
    title: t("bookingConfirmed.pageTitle"),
    path: "/booking-confirmation",
    noIndex: true,
  });
}

function formatTime(t) {
  return t?.slice(0, 5);
}

export default async function BookingConfirmationPage({ params }) {
  const { bookingNumber } = await params;
  const [booking, business, { locale, t }] = await Promise.all([
    getBookingByNumber(bookingNumber),
    getBusinessInfo(),
    getT(),
  ]);

  if (!booking) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 whitespace-nowrap text-xl font-bold">
            <Logo className="h-7 w-7" />
            {business.name}
          </a>
          <a href="/" className="text-sm font-medium hover:text-muted">
            &larr; {t("common.backToHome")}
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold">
          {t("bookingConfirmed.thanks", { name: booking.customer_name.split(" ")[0] })}
        </h1>
        <p className="mt-2 text-muted">
          {t("bookingConfirmed.yourBooking")}{" "}
          <span className="font-semibold text-foreground">{booking.booking_number}</span>{" "}
          {t("bookingConfirmed.placed", { email: booking.customer_email })}
        </p>

        <div className="mt-8 rounded-xl border border-border p-6 text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t("bookingConfirmed.details")}
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{t("booking.service")}</span>
              <span className="font-medium text-foreground">{booking.service_name}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("booking.date")}</span>
              <span className="font-medium text-foreground">
                {formatDate(booking.booking_date, locale, { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("bookingConfirmed.time")}</span>
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
          {t("bookingConfirmed.continue")}
        </a>
      </main>
    </div>
  );
}
