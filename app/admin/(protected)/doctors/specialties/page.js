import { getSpecialties } from "@/lib/doctors";
import { splitLines } from "@/lib/healthPackages";
import { deleteSpecialtyAction } from "../actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminDoctorSpecialtiesPage() {
  const specialties = await getSpecialties();

  return (
    <div className="w-full max-w-4xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm">
              <a href="/admin/doctors" className="text-accent hover:underline">
                ← Doctors
              </a>
            </p>
            <h1 className="mt-1 text-xl font-bold text-foreground">Specialties &amp; symptoms</h1>
            <p className="mt-1 text-sm text-muted">
              Each specialty&rsquo;s symptom and disease keywords (English and Bangla) power the doctor
              finder — a patient typing &ldquo;বুকে ব্যথা&rdquo; or &ldquo;chest pain&rdquo; is shown the matching
              specialty&rsquo;s doctors.
            </p>
          </div>
          <a
            href="/admin/doctors/specialties/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Add specialty
          </a>
        </div>

        {specialties.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No specialties yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {specialties.map((s) => {
              const keywordCount = splitLines(s.keywords_en).length + splitLines(s.keywords_bn).length;
              return (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {s.name_en}
                      {s.name_bn && <span className="font-normal text-muted"> · {s.name_bn}</span>}
                    </p>
                    <p className={`text-sm ${keywordCount ? "text-muted" : "text-red-600 dark:text-red-400"}`}>
                      {s.doctor_count} doctors · {keywordCount ? `${keywordCount} keywords` : "no keywords — patients can't find it by symptom"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`/admin/doctors/specialties/${s.id}/edit`}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-alt"
                    >
                      Edit
                    </a>
                    <form action={deleteSpecialtyAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <DeleteButton
                        confirmMessage={`Delete "${s.name_en}"? Its doctors stay listed, without a specialty.`}
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
    </div>
  );
}
