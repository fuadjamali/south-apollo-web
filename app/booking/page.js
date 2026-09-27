import Logo from "@/components/Logo";
import BookingFlow from "@/components/BookingFlow";
import { getActiveMemberSession } from "@/lib/memberSession";
import { getActiveBookingServices } from "@/lib/bookingServices";
import { getBusinessInfo } from "@/lib/businessInfo";
import { buildPageMetadata } from "@/lib/seo";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getT();
  return buildPageMetadata({
    title: t("booking.pageTitle"),
    description: t("booking.metaDescription"),
    path: "/booking",
  });
}

export default async function BookingPage() {
  const [{ t }, member, services, business] = await Promise.all([
    getT(),
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
            &larr; {t("common.backToHome")}
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold">{t("booking.title")}</h1>
        <p className="mt-2 text-muted">
          {t("booking.intro")}
        </p>

        <BookingFlow services={services} member={member} />
      </main>
    </div>
  );
}
