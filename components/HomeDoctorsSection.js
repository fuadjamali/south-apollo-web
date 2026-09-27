import { IconSearch, IconArrowRight, IconStethoscope } from "@tabler/icons-react";
import { buildIndex, searchDoctors, FINDER_PROBLEMS } from "@/lib/doctorSearch";

function pick(row, field, locale) {
  const en = row[`${field}_en`];
  const bn = row[`${field}_bn`];
  return locale === "bn" ? bn || en : en || bn;
}

// Up to `count` doctors with photos, one per department first so the strip shows the breadth of
// the directory rather than four cardiologists; topped up from the rest if there are fewer
// departments than slots.
function featuredDoctors(doctors, count) {
  const withPhoto = doctors.filter((d) => d.photo);
  const seen = new Set();
  const picked = [];
  for (const d of withPhoto) {
    if (picked.length === count) break;
    if (seen.has(d.specialty_id)) continue;
    seen.add(d.specialty_id);
    picked.push(d);
  }
  for (const d of withPhoto) {
    if (picked.length === count) break;
    if (!picked.includes(d)) picked.push(d);
  }
  return picked;
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
  const featured = featuredDoctors(doctors, 4);

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

          {featured.length > 0 && (
            <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-4 lg:mr-0">
              {featured.map((d, i) => (
                <a
                  key={d.id}
                  href={`/doctors?q=${encodeURIComponent(pick(d, "name", locale) || "")}`}
                  className={`group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition hover:shadow-md ${i >= 2 ? "hidden sm:block" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.photo}
                    alt={pick(d, "name", locale)}
                    loading="lazy"
                    className="aspect-square w-full object-cover object-top transition group-hover:scale-[1.02]"
                  />
                  <div className="p-3">
                    <p className="text-sm font-semibold leading-snug">{pick(d, "name", locale)}</p>
                    {pick(d, "specialty", locale) && (
                      <p className="mt-0.5 text-xs text-primary">{pick(d, "specialty", locale)}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
