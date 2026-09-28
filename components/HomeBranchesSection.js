import { IconBuildingHospital, IconMapPin, IconPhone, IconDirections, IconStarFilled } from "@tabler/icons-react";
import { parsePhoneLines, phoneLabel } from "@/lib/contactInfo";
import { directionsHref } from "@/lib/branches";

function pick(row, field, locale) {
  const en = row[`${field}_en`];
  const bn = row[`${field}_bn`];
  return locale === "bn" ? bn || en : en || bn;
}

const tel = (number) => `tel:${number.replace(/[^\d+]/g, "")}`;

// Home "Our Branches": one card per active branch, main branch first — name, a short intro,
// address, every phone number as a tap-to-call link, and a Google Maps directions link.
export default function HomeBranchesSection({ heading, subheading, branches, locale, t, sectionMaxW, style }) {
  return (
    <section id="branches" className="py-20" style={style}>
      <div className={`mx-auto ${sectionMaxW} px-6`}>
        <div className="text-center">
          <h2 className="text-3xl font-bold">{heading}</h2>
          {subheading && <p className="mx-auto mt-2 max-w-2xl text-muted">{subheading}</p>}
        </div>

        <div className={`mt-10 grid gap-8 ${branches.length > 1 ? "md:grid-cols-2" : "mx-auto max-w-xl"}`}>
          {branches.map((branch) => {
            const directions = directionsHref(branch);
            const firstNumber = parsePhoneLines(branch.phones)[0]?.numbers[0];
            return (
              <article
                key={branch.id}
                className={`relative flex flex-col overflow-hidden rounded-3xl border bg-surface shadow-sm ${
                  branch.is_main ? "border-primary/40" : "border-border"
                }`}
              >
                <div className="h-1.5 bg-gradient-to-r from-primary to-accent" aria-hidden="true" />
                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-start gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <IconBuildingHospital size={30} stroke={1.6} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      {branch.is_main && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
                          <IconStarFilled size={12} aria-hidden="true" />
                          {t("branches.main")}
                        </span>
                      )}
                      <h3 className="mt-1 text-xl font-bold leading-snug">{pick(branch, "name", locale)}</h3>
                    </div>
                  </div>

                  {pick(branch, "intro", locale) && (
                    <p className="mt-4 whitespace-pre-line leading-relaxed text-muted">{pick(branch, "intro", locale)}</p>
                  )}

                  <div className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
                    {pick(branch, "address", locale) && (
                      <p className="flex gap-3">
                        <IconMapPin size={20} className="mt-px shrink-0 text-primary" aria-hidden="true" />
                        <span>{pick(branch, "address", locale)}</span>
                      </p>
                    )}
                    {parsePhoneLines(branch.phones).map((line, i) => (
                      <p key={i} className="flex gap-3">
                        <IconPhone size={20} className="mt-px shrink-0 text-primary" aria-hidden="true" />
                        <span className="flex flex-wrap gap-x-3 gap-y-1">
                          {line.label && <span className="font-semibold">{phoneLabel(line.label, t)}:</span>}
                          {line.numbers.map((number) => (
                            <a key={number} href={tel(number)} className="hover:text-primary hover:underline">
                              {number}
                            </a>
                          ))}
                        </span>
                      </p>
                    ))}
                  </div>

                  <div className="mt-auto flex flex-wrap gap-3 pt-6">
                    {directions && (
                      <a
                        href={directions}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
                      >
                        <IconDirections size={16} aria-hidden="true" />
                        {t("branches.directions")}
                      </a>
                    )}
                    {firstNumber && (
                      <a
                        href={tel(firstNumber)}
                        className="inline-flex items-center gap-2 rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"
                      >
                        <IconPhone size={16} aria-hidden="true" />
                        {t("branches.call")} {firstNumber}
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
