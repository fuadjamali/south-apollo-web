import { PLAN } from "@/lib/plan";

export const dynamic = "force-dynamic";

// Mirrors docs/package-plans.md's "Feature comparison" table — keep both in sync if the
// tier/module mapping changes. Deliberately static (not derived from lib/plan.js's module
// list) since it's meant to read like a sales comparison, not a literal dump of internal
// module names.
const FEATURES = [
  { label: "Home page (hero, stats, how it works, about, map)", basic: true, plus: true, premium: true },
  { label: "Contact info block + enquiry form", basic: true, plus: true, premium: true },
  { label: "WhatsApp CTA + social links", basic: true, plus: true, premium: true },
  { label: "Products or Portfolio showcase", basic: true, plus: true, premium: true },
  { label: "Both Products and Portfolio", basic: false, plus: true, premium: true },
  { label: "Full 8-theme switcher + dark mode", basic: false, plus: true, premium: true },
  { label: "Basic analytics (visit counter)", basic: true, plus: true, premium: true },
  { label: "Blog", basic: false, plus: true, premium: true },
  { label: "Gallery", basic: false, plus: true, premium: true },
  { label: "News & Events", basic: false, plus: true, premium: true },
  { label: "Reviews (third-party ratings) + Partners strip", basic: false, plus: true, premium: true },
  { label: "Customer-submitted reviews (moderated)", basic: false, plus: true, premium: true },
  { label: "Team & Team Members", basic: false, plus: true, premium: true },
  { label: "Certifications", basic: false, plus: true, premium: true },
  { label: "“Write with AI” content assistant", basic: false, plus: true, premium: true },
  { label: "Online booking / appointment scheduling", basic: false, plus: true, premium: true },
  { label: "Booking waitlist for fully-booked dates", basic: false, plus: true, premium: true },
  { label: "Shopping cart + checkout + order management", basic: false, plus: false, premium: true },
  { label: "Discount / promo codes at checkout", basic: false, plus: false, premium: true },
  { label: "Member login portal + order history", basic: false, plus: false, premium: true },
  { label: "Membership verification lookup", basic: false, plus: false, premium: true },
];

const TIERS = [
  { key: "basic", label: "Basic" },
  { key: "plus", label: "Plus" },
  { key: "premium", label: "Premium" },
];

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
