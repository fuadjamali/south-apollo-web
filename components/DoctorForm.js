"use client";

import { useActionState } from "react";
import ImageFileInput from "@/components/ImageFileInput";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";
const labelClass = "block text-sm font-medium text-foreground";

// English and Bangla side by side for every visitor-facing field — the page shows whichever
// matches the visitor's language (falling back to the other), and the finder searches both.
function Pair({ label, name, doctor, rows, placeholderEn, placeholderBn, required }) {
  const Field = rows ? "textarea" : "input";
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[
        ["en", "English", placeholderEn],
        ["bn", "বাংলা", placeholderBn],
      ].map(([lang, langLabel, placeholder]) => (
        <div key={lang}>
          <label className={labelClass}>
            {label} <span className="font-normal text-muted">({langLabel})</span>
          </label>
          <Field
            {...(rows ? { rows } : { type: "text" })}
            name={`${name}_${lang}`}
            required={required}
            defaultValue={doctor?.[`${name}_${lang}`] || ""}
            placeholder={placeholder}
            className={fieldClass}
          />
        </div>
      ))}
    </div>
  );
}

export default function DoctorForm({ action, doctor, specialties, submitLabel }) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <Pair label="Name" name="name" doctor={doctor} placeholderEn="Prof. Dr. Abul Kalam Azad" placeholderBn="অধ্যাপক ডাঃ আবুল কালাম আজাদ" />

      <div>
        <label className={labelClass}>Specialty</label>
        <select name="specialty_id" defaultValue={doctor?.specialty_id || ""} className={fieldClass}>
          <option value="">— None —</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name_en}
              {s.name_bn ? ` / ${s.name_bn}` : ""}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted">
          The specialty&rsquo;s symptom keywords are what lets patients find this doctor by describing
          their problem. <a href="/admin/doctors/specialties" className="text-accent hover:underline">Manage specialties</a>
        </p>
      </div>

      <Pair label="Degrees" name="degrees" doctor={doctor} rows={2} placeholderEn="MBBS, FCPS (Medicine)" placeholderBn="এমবিবিএস, এফসিপিএস (মেডিসিন)" />
      <Pair label="Designation / workplace" name="designation" doctor={doctor} rows={2} placeholderEn="Associate Professor, Medicine" placeholderBn="সহযোগী অধ্যাপক, মেডিসিন" />
      <Pair label="Treats (special interests)" name="expertise" doctor={doctor} rows={2} placeholderEn="Diabetes, thyroid, high blood pressure" placeholderBn="ডায়াবেটিস, থাইরয়েড, উচ্চ রক্তচাপ" />
      <Pair label="Visiting hours" name="schedule" doctor={doctor} rows={2} placeholderEn="Sat–Thu, 5 pm – 9 pm" placeholderBn="শনি–বৃহস্পতি, বিকাল ৫টা – রাত ৯টা" />
      <div>
        <Pair label="Search keywords — symptoms & diseases" name="keywords" doctor={doctor} rows={4} placeholderEn={"joint pain\nback pain\nfracture"} placeholderBn={"জোড়ার ব্যথা\nকোমর ব্যথা\nহাড় ভাঙা"} />
        <p className="mt-1 text-xs text-muted">
          One per line (or comma-separated). Not shown on the card — used by the finder, on top of the
          specialty&rsquo;s own keywords.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Room</label>
          <input type="text" name="room" defaultValue={doctor?.room || ""} placeholder="204" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Fee (BDT)</label>
          <input type="text" inputMode="numeric" name="fee" defaultValue={doctor?.fee ?? ""} placeholder="800" className={fieldClass} />
          <p className="mt-1 text-xs text-muted">Leave blank to hide.</p>
        </div>
        <div>
          <label className={labelClass}>Serial phone</label>
          <input type="text" name="serial_phone" defaultValue={doctor?.serial_phone || ""} placeholder="01711-457444" className={fieldClass} />
          <p className="mt-1 text-xs text-muted">Blank uses the main hotline.</p>
        </div>
      </div>

      <div>
        <ImageFileInput
          name="photoFile"
          label="Headshot"
          currentImage={doctor?.photo}
          cropAspectRatio="4:5"
          previewClassName="mt-2 h-32 w-[6.4rem] rounded-lg border border-border object-cover"
          helpText={
            doctor?.photo
              ? "Choose a file to replace it, or leave blank to keep it."
              : "Optional — a portrait (4:5) headshot works best."
          }
        />
        {doctor?.photo && (
          <label className="mt-2 flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" name="removePhoto" className="h-4 w-4 rounded border-border" />
            Remove current photo
          </label>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Display order</label>
          <input type="number" name="display_order" defaultValue={doctor?.display_order ?? 0} className={fieldClass} />
          <p className="mt-1 text-xs text-muted">Lower numbers show first.</p>
        </div>
        <label className="mt-7 flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            name="active"
            defaultChecked={doctor ? doctor.active : true}
            className="h-4 w-4 rounded border-border"
          />
          Show on the website
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          name="telehealth"
          defaultChecked={doctor?.telehealth}
          className="h-4 w-4 rounded border-border"
        />
        Offers online (telehealth) consultation
      </label>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <a
          href="/admin/doctors"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
