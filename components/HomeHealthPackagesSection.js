import { splitLines, discountPercent } from "@/lib/healthPackages";

// Home-page teaser for the Health Check-up page: each package's picture, price and saving, and
// how many tests it covers — the full test lists, awareness text and contacts stay on
// /health-checkup, which every card links to.
export default function HomeHealthPackagesSection({ heading, subheading, packages, t, sectionMaxW, style }) {
  const price = (amount) => t("packages.price", { amount: amount.toLocaleString("en-US") });

  return (
    <section id="health-packages" className="bg-surface-alt py-20" style={style}>
      <div className={`mx-auto ${sectionMaxW} px-6`}>
        <h2 className="text-3xl font-bold">{heading}</h2>
        {subheading && <p className="mt-2 text-muted">{subheading}</p>}

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {packages.slice(0, 3).map((pkg) => {
            const percent = discountPercent(pkg);
            const testCount = splitLines(pkg.tests).length;
            return (
              <a
                key={pkg.id}
                href="/health-checkup"
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition hover:shadow-md"
              >
                {pkg.image && (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pkg.image} alt={pkg.name} loading="lazy" className="aspect-video w-full object-cover" />
                    {percent !== null && (
                      <span className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-sm font-bold text-accent-foreground shadow">
                        {t("packages.save", { percent })}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold group-hover:text-primary">{pkg.name}</h3>
                  {testCount > 0 && <p className="mt-1 text-sm text-muted">{t("home.testsIncluded", { count: testCount })}</p>}
                  <div className="mt-auto flex items-baseline gap-2 pt-4">
                    <span className="text-2xl font-extrabold text-primary">{price(pkg.price)}</span>
                    {percent !== null && <s className="text-sm text-muted">{price(pkg.previous_price)}</s>}
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <a
            href="/health-checkup"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-background"
          >
            {t("home.viewAllPackages")}
          </a>
        </div>
      </div>
    </section>
  );
}
