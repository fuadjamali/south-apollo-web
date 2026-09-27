import { getAllDoctors } from "@/lib/doctors";
import { countPendingAppointments } from "@/lib/doctorAppointments";
import { deleteDoctorAction } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminDoctorsPage({ searchParams }) {
  const { q = "", filter = "" } = await searchParams;
  const [all, pendingAppointments] = await Promise.all([getAllDoctors(), countPendingAppointments()]);
  const needle = q.toString().trim().toLowerCase();
  const doctors = all.filter((d) => {
    if (filter === "no-photo" && d.photo) return false;
    if (filter === "hidden" && d.active) return false;
    if (!needle) return true;
    return [d.name_en, d.name_bn, d.specialty_en, d.specialty_bn]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(needle));
  });
  const missingPhotos = all.filter((d) => !d.photo).length;

  return (
    <div className="w-full max-w-5xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Doctors</h1>
            <p className="mt-1 text-sm text-muted">
              {all.length} doctors on the{" "}
              <a href="/doctors" target="_blank" className="text-accent hover:underline">
                Find a Doctor page
              </a>
              {missingPhotos > 0 && <> · {missingPhotos} without a photo</>}. Changes appear on the live
              site immediately.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/admin/doctors/appointments"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
            >
              Appointments
              {pendingAppointments > 0 && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
                  {pendingAppointments} new
                </span>
              )}
            </a>
            <a
              href="/admin/doctors/specialties"
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
            >
              Specialties &amp; symptoms
            </a>
            <a
              href="/admin/doctors/new"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              Add doctor
            </a>
          </div>
        </div>

        <form className="mt-6 flex flex-wrap gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by name or specialty"
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          />
          <select name="filter" defaultValue={filter} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm">
            <option value="">All doctors</option>
            <option value="no-photo">Without photo</option>
            <option value="hidden">Hidden</option>
          </select>
          <button type="submit" className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-alt">
            Filter
          </button>
        </form>

        {doctors.length === 0 ? (
          <p className="mt-6 text-sm text-muted">
            {all.length === 0 ? "No doctors yet." : "No doctors match this filter."}
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {doctors.map((d) => (
              <div
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {d.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.photo} alt="" className="h-14 w-11 shrink-0 rounded-md object-cover" />
                  ) : (
                    <div className="flex h-14 w-11 shrink-0 items-center justify-center rounded-md bg-surface-alt text-xs text-muted">
                      No photo
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                      {d.name_en || d.name_bn}
                      {!d.active && (
                        <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs font-medium text-muted">
                          Hidden
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted">
                      {d.name_en && d.name_bn ? `${d.name_bn} · ` : ""}
                      {d.specialty_en || "No specialty"} · order {d.display_order}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/doctors/${d.id}/edit`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                  >
                    Edit
                  </a>
                  <form action={deleteDoctorAction}>
                    <input type="hidden" name="id" value={d.id} />
                    <DeleteButton
                      confirmMessage={`Delete "${d.name_en || d.name_bn}"? This can't be undone.`}
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
