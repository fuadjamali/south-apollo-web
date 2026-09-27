import { getAppointments, APPOINTMENT_STATUSES } from "@/lib/doctorAppointments";
import { updateAppointmentAction } from "../actions";

export const dynamic = "force-dynamic";

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Confirmed: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  Completed: "bg-surface-alt text-muted",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

// `value` is the DATE as text ("2026-09-28") — see getAppointments — so no timezone can shift it.
function formatDate(value) {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function formatReceived(value) {
  return new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dhaka" });
}

export default async function AdminDoctorAppointmentsPage({ searchParams }) {
  const { status = "" } = await searchParams;
  const filter = APPOINTMENT_STATUSES.includes(status) ? status : "";
  const appointments = await getAppointments({ status: filter });

  return (
    <div className="w-full max-w-5xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <p className="text-sm">
          <a href="/admin/doctors" className="text-accent hover:underline">
            ← Doctors
          </a>
        </p>
        <h1 className="mt-1 text-xl font-bold text-foreground">Doctor appointment requests</h1>
        <p className="mt-1 text-sm text-muted">
          Sent from the &ldquo;Book appointment&rdquo; button on the Find a Doctor page. Call the patient to
          give their serial, then mark the request Confirmed.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {["", ...APPOINTMENT_STATUSES].map((s) => (
            <a
              key={s || "all"}
              href={s ? `/admin/doctors/appointments?status=${s}` : "/admin/doctors/appointments"}
              className={`rounded-full border px-3 py-1 text-sm font-medium ${
                filter === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-surface-alt"
              }`}
            >
              {s || "All"}
            </a>
          ))}
        </div>

        {appointments.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No appointment requests{filter ? ` marked ${filter}` : " yet"}.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {appointments.map((a) => (
              <div key={a.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                      {a.patient_name}
                      {a.patient_age && <span className="font-normal text-muted">· age {a.patient_age}</span>}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[a.status]}`}>
                        {a.status}
                      </span>
                    </p>
                    <p className="mt-1 text-sm">
                      <a href={`tel:${a.phone}`} className="font-semibold text-accent hover:underline">
                        {a.phone}
                      </a>
                      <span className="text-muted">
                        {" "}· wants <strong className="text-foreground">{a.doctor_name}</strong>
                        {a.doctor_room ? ` (room ${a.doctor_room})` : ""} on{" "}
                        <strong className="text-foreground">{formatDate(a.preferred_date_text)}</strong>
                      </span>
                    </p>
                    {a.notes && <p className="mt-2 whitespace-pre-line text-sm text-foreground">{a.notes}</p>}
                    <p className="mt-2 text-xs text-muted">
                      {a.reference} · received {formatReceived(a.created_at)}
                    </p>
                  </div>
                </div>

                <form action={updateAppointmentAction} className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  <input type="hidden" name="id" value={a.id} />
                  <select
                    name="status"
                    defaultValue={a.status}
                    className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm"
                    aria-label="Status"
                  >
                    {APPOINTMENT_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="staffNote"
                    defaultValue={a.staff_note || ""}
                    placeholder="Staff note, e.g. serial 12, 5:30 pm"
                    className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
                  >
                    Save
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
