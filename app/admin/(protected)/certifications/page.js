import { getCertifications } from "@/lib/certifications";
import { deleteCertificationAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminCertificationsPage() {
  const certifications = await getCertifications();

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Certifications</h1>
            <p className="mt-1 text-sm text-muted">
              Shown as a badge strip on the home page. Changes appear on the live site
              immediately.
            </p>
          </div>
          <a
            href="/admin/certifications/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Add certification
          </a>
        </div>

        {certifications.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No certifications yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-4">
                  {cert.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cert.image}
                      alt=""
                      className="h-12 w-12 rounded-full border border-border bg-surface-alt object-contain p-1"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800" />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">{cert.name}</p>
                    <p className="text-sm text-muted">order {cert.display_order}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/certifications/${cert.id}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    View
                  </a>
                  <a
                    href={`/admin/certifications/${cert.id}/edit`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    Edit
                  </a>
                  <form action={deleteCertificationAction}>
                    <input type="hidden" name="id" value={cert.id} />
                    <DeleteButton
                      confirmMessage={`Delete "${cert.name}"? This can't be undone.`}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-surface-alt dark:text-red-400"
                    />
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
