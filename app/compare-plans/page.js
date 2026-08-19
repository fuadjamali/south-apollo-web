import { Fragment } from "react";
import Logo from "@/components/Logo";
import { FEATURES, TIERS } from "@/lib/planFeatures";
import siteConfig from "@/config/site";

function Check({ included }) {
  return included ? (
    <span
      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900/40 dark:text-green-400"
      aria-label="Included"
    >
      &#10003;
    </span>
  ) : (
    <span className="text-sm text-muted" aria-label="Not included">
      &mdash;
    </span>
  );
}

// Groups FEATURES by its `group` field while preserving source order — same grouping shown in
// admin Settings → Feature Config, so this page and that one never drift apart.
function groupFeatures(features) {
  const groups = [];
  for (const feature of features) {
    const last = groups[groups.length - 1];
    if (last?.label === feature.group) {
      last.items.push(feature);
    } else {
      groups.push({ label: feature.group, items: [feature] });
    }
  }
  return groups;
}

export default function ComparePlansPage() {
  const groups = groupFeatures(FEATURES);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 whitespace-nowrap text-xl font-bold">
            <Logo className="h-7 w-7" />
            {siteConfig.business.name}
          </a>
          <a href="/#plans" className="text-sm font-medium hover:text-muted">
            &larr; Back to plans
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-foreground to-primary text-primary-foreground">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="relative mx-auto max-w-5xl px-6 py-14 text-center sm:py-16">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Every feature, side by side
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/85 sm:text-base">
            No surprises either way — see exactly what&apos;s included in Basic, Plus, and
            Premium before you choose.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 pb-16">
        {/* Pricing cards */}
        <div className="-mt-8 grid gap-5 sm:-mt-10 sm:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.key}
              className={`relative rounded-2xl border bg-surface p-6 text-center shadow-lg ${
                tier.popular ? "border-primary ring-2 ring-primary" : "border-border"
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow">
                  Most popular
                </span>
              )}
              <p className="text-base font-bold">{tier.label}</p>
              <p className="mt-1 min-h-[34px] text-xs text-muted">{tier.blurb}</p>
              <p className="mt-4 text-3xl font-extrabold">
                <sup className="text-base font-bold align-top">£</sup>
                {tier.setupPrice.replace("£", "")}
              </p>
              <p className="mt-1 text-xs text-muted">
                setup ·{" "}
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {tier.monthlyPrice}
                </span>
                /mo
              </p>
              <a
                href="/#enquiry"
                className={`mt-5 block rounded-full py-2.5 text-sm font-semibold ${
                  tier.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                    : "border border-border text-foreground hover:bg-surface-alt"
                }`}
              >
                Get started
              </a>
            </div>
          ))}
        </div>

        {/* Grouped comparison — table on sm+, stacked cards on mobile */}
        <div className="mt-12">
          {/* Desktop / tablet: grouped table, sticky feature column so it scrolls cleanly on
              narrower widths instead of the whole page shifting. */}
          <div className="hidden overflow-x-auto rounded-xl border border-border sm:block">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="bg-surface-alt">
                  <th className="sticky left-0 z-10 bg-surface-alt py-3 pl-4 pr-3 text-left font-semibold text-muted">
                    Feature
                  </th>
                  {TIERS.map((tier) => (
                    <th
                      key={tier.key}
                      className={`px-3 py-3 text-center font-bold ${
                        tier.popular ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {tier.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <Fragment key={group.label}>
                    <tr className="bg-primary/10">
                      <td
                        colSpan={TIERS.length + 1}
                        className="sticky left-0 py-1.5 pl-4 text-xs font-bold uppercase tracking-wide text-primary"
                      >
                        {group.label}
                      </td>
                    </tr>
                    {group.items.map((feature) => (
                      <tr key={feature.label} className="border-b border-border last:border-0">
                        <td className="sticky left-0 z-10 bg-background py-2.5 pl-4 pr-3 text-foreground">
                          {feature.label}
                        </td>
                        {TIERS.map((tier) => (
                          <td key={tier.key} className="px-3 py-2.5 text-center">
                            <Check included={feature[tier.key]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: one card per plan, full feature list with tick/dash — avoids a cramped
              horizontally-scrolling table on small screens. */}
          <div className="space-y-6 sm:hidden">
            {TIERS.map((tier) => (
              <div
                key={tier.key}
                className={`rounded-xl border bg-surface p-5 ${
                  tier.popular ? "border-primary" : "border-border"
                }`}
              >
                <p className={`text-base font-bold ${tier.popular ? "text-primary" : ""}`}>
                  {tier.label}
                </p>
                <div className="mt-3 divide-y divide-border">
                  {groups.map((group) => (
                    <div key={group.label} className="py-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-primary">
                        {group.label}
                      </p>
                      <ul className="mt-1.5 space-y-1.5">
                        {group.items.map((feature) => (
                          <li
                            key={feature.label}
                            className="flex items-start justify-between gap-3 text-sm"
                          >
                            <span
                              className={
                                feature[tier.key] ? "text-foreground" : "text-muted line-through"
                              }
                            >
                              {feature.label}
                            </span>
                            <Check included={feature[tier.key]} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a
            href="/#enquiry"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Get started
          </a>
          <a
            href="/"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-surface-alt"
          >
            Back to home
          </a>
        </div>
      </main>
    </div>
  );
}
