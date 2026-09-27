import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DoctorFinder from "@/components/DoctorFinder";
import { getT } from "@/lib/i18n/server";
import { getSiteHeaderProps } from "@/lib/siteHeader";
import { buildPageMetadata } from "@/lib/seo";
import { getActiveDoctors, getSpecialties } from "@/lib/doctors";
import { getHealthCheckupPage } from "@/lib/healthPackages";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getT();
  return buildPageMetadata({
    title: t("doctors.pageTitle"),
    description: t("doctors.intro"),
    path: "/doctors",
  });
}

// Only the columns the finder actually shows or searches go to the browser.
const PUBLIC_FIELDS = [
  "id", "name_en", "name_bn", "degrees_en", "degrees_bn", "designation_en", "designation_bn",
  "expertise_en", "expertise_bn", "schedule_en", "schedule_bn", "specialty_id", "specialty_en",
  "specialty_bn", "specialty_keywords_en", "specialty_keywords_bn", "room", "fee", "serial_phone",
  "photo", "display_order", "keywords_en", "keywords_bn", "telehealth",
];

export default async function DoctorsPage({ searchParams }) {
  const { locale, t } = await getT();
  const [{ q }, headerProps, doctors, specialties, checkupPage] = await Promise.all([
    searchParams,
    getSiteHeaderProps(locale),
    getActiveDoctors(),
    getSpecialties(),
    getHealthCheckupPage(),
  ]);

  const publicDoctors = doctors.map((d) => Object.fromEntries(PUBLIC_FIELDS.map((f) => [f, d[f] ?? null])));
  const publicSpecialties = specialties.map(({ id, name_en, name_bn, keywords_en, keywords_bn }) => ({
    id,
    name_en,
    name_bn,
    keywords_en,
    keywords_bn,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader {...headerProps} />

      <main>
        <section className="border-b border-border bg-surface-alt">
          <div className="mx-auto max-w-4xl px-6 py-14 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">{t("doctors.eyebrow")}</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t("doctors.heading")}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted">{t("doctors.intro")}</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10">
          <DoctorFinder
            doctors={publicDoctors}
            specialties={publicSpecialties}
            initialQuery={typeof q === "string" ? q : ""}
            // The clinic's appointment hotline — kept with the Health Check-up page text at
            // /admin/health-packages; used when a doctor has no serial number of their own.
            hotline={checkupPage?.hotline || ""}
          />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
