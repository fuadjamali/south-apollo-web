import Logo from "@/components/Logo";
import { FEATURES, TIERS } from "@/lib/planFeatures";
import siteConfig from "@/config/site";

function Check({ included }) {
  return included ? (
    <span className="text-green-600 dark:text-green-400" aria-label="Included">
      &#10003;
    </span>
  ) : (
    <span className="text-muted" aria-label="Not included">
      &mdash;
    </span>
  );
}

export default function ComparePlansPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 whitespace-nowrap text-xl font-bold">
            <Logo className="h-7 w-7" />
            {siteConfig.business.name}
          </a>
          <a href="/#plans" className="text-sm font-medium hover:text-muted">
            &larr; Back to plans
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-bold">Compare plans</h1>
        <p className="mt-2 text-muted">Every feature, side by side — no surprises either way.</p>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-border py-3 pr-3 text-left font-medium text-muted">
                  Feature
                </th>
                {TIERS.map((tier) => (
                  <th
                    key={tier.key}
                    className={`border-b border-border px-3 py-3 text-center ${
                      tier.popular ? "text-accent" : "text-foreground"
                    }`}
                  >
                    <p className="font-bold">{tier.label}</p>
                    <p className="mt-1 text-xs font-normal text-muted">
                      {tier.setupPrice} setup · {tier.monthlyPrice}/mo
                    </p>
                    {tier.popular && (
                      <span className="mt-1 inline-block rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                        Most popular
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature) => (
                <tr key={feature.label} className="border-b border-border">
                  <td className="py-2.5 pr-3 text-foreground">{feature.label}</td>
                  {TIERS.map((tier) => (
                    <td key={tier.key} className="px-3 py-2.5 text-center">
                      <Check included={feature[tier.key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
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
