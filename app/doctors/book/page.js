import { redirect } from "next/navigation";
import { IconArrowLeft, IconClock, IconDoor, IconCash, IconPhone } from "@tabler/icons-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DoctorAppointmentForm from "@/components/DoctorAppointmentForm";
import { getT } from "@/lib/i18n/server";
import { getSiteHeaderProps } from "@/lib/siteHeader";
import { buildPageMetadata } from "@/lib/seo";
import { getDoctor } from "@/lib/doctors";
import { getHealthCheckupPage } from "@/lib/healthPackages";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getT();
  return buildPageMetadata({ title: t("appointment.pageTitle"), path: "/doctors/book" });
}

function pick(row, field, locale) {
  const en = row[`${field}_en`];
  const bn = row[`${field}_bn`];
  return locale === "bn" ? bn || en : en || bn;
}

function telHref(number) {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}

function dhakaDate(offsetDays = 0) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date());
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export default async function BookDoctorPage({ searchParams }) {
  const { doctor: doctorParam } = await searchParams;
  const doctorId = parseInt(doctorParam, 10);
  const doctor = doctorId ? await getDoctor(doctorId) : null;
  if (!doctor || !doctor.active) redirect("/doctors");

  const { locale, t } = await getT();
  const [headerProps, checkupPage] = await Promise.all([getSiteHeaderProps(locale), getHealthCheckupPage()]);
  const phone = doctor.serial_phone || checkupPage?.hotline || "";
  const name = pick(doctor, "name", locale);
  const schedule = pick(doctor, "schedule", locale);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader {...headerProps} />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <a href="/doctors" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          <IconArrowLeft size={16} aria-hidden="true" />
          {t("appointment.backToDoctors")}
        </a>
        <h1 className="mt-3 text-3xl font-bold">{t("appointment.heading")}</h1>
        <p className="mt-2 text-muted">{t("appointment.intro")}</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          {/* The doctor being booked */}
          <aside className="h-fit rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex gap-4">
              {doctor.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={doctor.photo}
                  alt={name}
                  className="h-32 w-[6.4rem] shrink-0 rounded-xl border border-border object-cover"
                />
              )}
              <div className="min-w-0">
                <h2 className="text-lg font-bold leading-snug">{name}</h2>
                {pick(doctor, "degrees", locale) && (
                  <p className="mt-1 text-sm text-muted">{pick(doctor, "degrees", locale)}</p>
                )}
                {pick(doctor, "specialty", locale) && (
                  <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                    {pick(doctor, "specialty", locale)}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              {schedule && (
                <p className="flex gap-2">
                  <IconClock size={18} className="mt-px shrink-0 text-primary" aria-hidden="true" />
                  <span>{schedule}</span>
                </p>
              )}
              {doctor.room && (
                <p className="flex gap-2">
                  <IconDoor size={18} className="shrink-0 text-primary" aria-hidden="true" />
                  {t("doctors.room", { room: doctor.room })}
                </p>
              )}
              {doctor.fee && (
                <p className="flex gap-2">
                  <IconCash size={18} className="shrink-0 text-primary" aria-hidden="true" />
                  {t("doctors.fee", { amount: doctor.fee.toLocaleString("en-US") })}
                </p>
              )}
            </div>
            {phone && (
              <div className="mt-5 rounded-xl bg-surface-alt p-4 text-sm">
                <p className="text-muted">{t("appointment.preferCall")}</p>
                <a
                  href={telHref(phone)}
                  className="mt-2 inline-flex items-center gap-2 text-base font-bold text-primary hover:underline"
                >
                  <IconPhone size={18} aria-hidden="true" />
                  {phone}
                </a>
              </div>
            )}
          </aside>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <DoctorAppointmentForm
              doctorId={doctor.id}
              doctorName={name}
              phone={phone}
              minDate={dhakaDate(0)}
              maxDate={dhakaDate(60)}
            />
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
