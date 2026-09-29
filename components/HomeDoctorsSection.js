import { IconSearch, IconArrowRight, IconStethoscope } from "@tabler/icons-react";
import { buildIndex, searchDoctors, FINDER_PROBLEMS } from "@/lib/doctorSearch";
import HomeFeaturedDoctors from "@/components/HomeFeaturedDoctors";

function pick(row, field, locale) {
  const en = row[`${field}_en`];
  const bn = row[`${field}_bn`];
  return locale === "bn" ? bn || en : en || bn;
}

// Home-page teaser for the Find a Doctor page (/doctors): a search box that goes straight to
// results, a few one-tap common problems, and a handful of doctors — enough to show what's there
// and send the visitor on, not a second copy of the directory.
export default function HomeDoctorsSection({ heading, subheading, doctors, departmentCount, locale, t, sectionMaxW, style }) {
  const index = buildIndex(doctors);
  // Only problems that actually lead somewhere, labelled and searched in the page's language.
  const problems = FINDER_PROBLEMS.map((p) => ({ ...p, label: locale === "bn" ? p.bn : p.en }))
    .filter((p) => {
      const { results, loose } = searchDoctors(index, p.label);
      return results.length > 0 && !loose;
    })
    .slice(0, 6);
  // Lean payload for the client component — it only needs enough to render a photo card, not
  // the full doctor record (schedule, room, fee, keywords, ...).
  const photoCandidates = doctors
    .filter((d) => d.photo)
    .map((d) => ({
      id: d.id,
      name_en: d.name_en,
      name_bn: d.name_bn,
      specialty_id: d.specialty_id,
      specialty_en: d.specialty_en,
      specialty_bn: d.specialty_bn,
      photo: d.photo,
    }));

  return (
    <section id="find-doctor" className="py-20" style={style}>
      <div className={`mx-auto ${sectionMaxW} px-6`}>
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              <IconStethoscope size={16} aria-hidden="true" />
              {t("home.doctorsSummary", { doctors: doctors.length, departments: departmentCount })}
            </p>
            <h2 className="mt-4 text-3xl font-bold">{heading}</h2>
            {subheading && <p className="mt-2 text-muted">{subheading}</p>}

            <form action="/doctors" method="get" className="mt-6 flex gap-2" role="search">
              <div className="relative min-w-0 flex-1">
                <IconSearch
                  size={20}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  name="q"
                  aria-label={t("doctors.searchLabel")}
                  placeholder={t("home.doctorsSearchPlaceholder")}
                  className="w-full rounded-full border border-border bg-surface py-3 pl-12 pr-4 text-base shadow-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                {t("home.doctorsSearch")}
              </button>
            </form>

            {problems.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted">{t("home.doctorsCommon")}</span>
                {problems.map((p) => (
                  <a
                    key={p.q}
                    href={`/doctors?q=${encodeURIComponent(p.label)}`}
                    className="rounded-full border border-border bg-surface px-3 py-1 text-sm font-medium hover:border-primary hover:text-primary"
                  >
                    {p.label}
                  </a>
                ))}
              </div>
            )}

            <a
              href="/doctors"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:brightness-90"
            >
              {t("home.findDoctor")}
              <IconArrowRight size={16} aria-hidden="true" />
            </a>
          </div>

          {photoCandidates.length > 0 && (
            <HomeFeaturedDoctors candidates={photoCandidates} locale={locale} />
          )}
        </div>
      </div>
    </section>
  );
}
