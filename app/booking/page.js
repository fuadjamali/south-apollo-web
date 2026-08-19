import Logo from "@/components/Logo";
import BookingFlow from "@/components/BookingFlow";
import { getActiveMemberSession } from "@/lib/memberSession";
import { getActiveBookingServices } from "@/lib/bookingServices";
import { getBusinessInfo } from "@/lib/businessInfo";

export const dynamic = "force-dynamic";

export default async function BookingPage() {
  const [member, services, business] = await Promise.all([
    getActiveMemberSession(),
    getActiveBookingServices(),
    getBusinessInfo(),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 whitespace-nowrap text-xl font-bold">
            <Logo className="h-7 w-7" />
            {business.name}
          </a>
          <a href="/" className="text-sm font-medium hover:text-muted">
            &larr; Back to home
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold">Book an appointment</h1>
        <p className="mt-2 text-muted">
          Choose a service, pick a time that works for you, and we&apos;ll confirm your booking.
        </p>

        <BookingFlow services={services} member={member} />
      </main>
    </div>
  );
}
