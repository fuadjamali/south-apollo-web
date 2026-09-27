import { getAllPackages, getHealthCheckupPage, splitLines, discountPercent } from "@/lib/healthPackages";
import { deletePackageAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";
import HealthCheckupPageForm from "@/components/HealthCheckupPageForm";

export const dynamic = "force-dynamic";

const taka = (amount) => `BDT ${amount.toLocaleString("en-US")}/-`;

export default async function AdminHealthPackagesPage() {
  const [packages, page] = await Promise.all([getAllPackages(), getHealthCheckupPage()]);

  return (
    <div className="w-full max-w-4xl space-y-6 px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Health Check-up Packages</h1>
            <p className="mt-1 text-sm text-muted">
              Shown on the{" "}
              <a href="/health-checkup" target="_blank" className="text-accent hover:underline">
                Health Check-up page
              </a>{" "}
              in this order. Price changes appear on the live site immediately.
            </p>
          </div>
          <a
            href="/admin/health-packages/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Add package
          </a>
        </div>

        {packages.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No packages yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {packages.map((pkg) => {
              const percent = discountPercent(pkg);
              return (
                <div
                  key={pkg.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
                >
                  <div>
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                      {pkg.name}
                      {!pkg.active && (
                        <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs font-medium text-muted">
                          Hidden
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted">
                      {percent !== null && (
                        <>
                          <s>{taka(pkg.previous_price)}</s>{" "}
                        </>
                      )}
                      <span className="font-semibold text-foreground">{taka(pkg.price)}</span>
                      {percent !== null && ` (${percent}% off)`} · {splitLines(pkg.tests).length}{" "}
                      tests · order {pkg.display_order}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`/admin/health-packages/${pkg.id}/edit`}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                    >
                      Edit
                    </a>
                    <form action={deletePackageAction}>
                      <input type="hidden" name="id" value={pkg.id} />
                      <DeleteButton
                        confirmMessage={`Delete "${pkg.name}"? This can't be undone.`}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-surface-alt dark:text-red-400"
                      />
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">Page text</h2>
        <p className="mt-1 text-sm text-muted">
          The heading, awareness message, &ldquo;why choose us&rdquo; points and contact numbers around the
          packages. Leave a section empty to hide it.
        </p>
        <HealthCheckupPageForm page={page} />
      </div>
    </div>
  );
}
