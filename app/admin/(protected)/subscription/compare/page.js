import { PLAN } from "@/lib/plan";
import { FEATURES, TIERS } from "@/lib/planFeatures";

export const dynamic = "force-dynamic";

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
    <div className="w-full max-w-3xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Compare plans</h1>
            <p className="mt-1 text-sm text-muted">
              What&apos;s included in each tier. Your current plan is highlighted.
            </p>
          </div>
          <a
            href="/admin/subscription"
            className="text-sm font-medium text-muted hover:underline"
          >
            &larr; Back to subscription
          </a>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-border py-2 pr-3 text-left font-medium text-muted">
                  Feature
                </th>
                {TIERS.map((tier) => (
                  <th
                    key={tier.key}
                    className={`border-b border-border px-3 py-2 text-center font-semibold ${
                      tier.key === PLAN ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {tier.label}
                    {tier.key === PLAN && (
                      <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                        Current
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature) => (
                <tr key={feature.label} className="border-b border-border">
                  <td className="py-2 pr-3 text-foreground">{feature.label}</td>
                  {TIERS.map((tier) => (
                    <td
                      key={tier.key}
                      className={`px-3 py-2 text-center ${tier.key === PLAN ? "bg-surface-alt" : ""}`}
                    >
                      <Check included={feature[tier.key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-muted">
          Want to move to a different tier? Contact us — upgrades don&apos;t need a rebuild, just
          a plan change on our end.
        </p>
      </div>
    </div>
  );
}
