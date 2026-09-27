"use client";

import { useActionState } from "react";
import { IconCircleCheck, IconPhone } from "@tabler/icons-react";
import { useT } from "@/components/LocaleContext";
import { requestAppointmentAction } from "@/app/doctors/book/actions";

const fieldClass =
  "mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const labelClass = "block text-sm font-semibold text-foreground";

function telHref(number) {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}

export default function DoctorAppointmentForm({ doctorId, doctorName, phone, minDate, maxDate }) {
  const t = useT();
  const [state, formAction, pending] = useActionState(requestAppointmentAction, {});
  const v = state?.values || {};

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-green-600/30 bg-green-600/5 p-6 text-center" role="status">
        <IconCircleCheck size={48} className="mx-auto text-green-600" aria-hidden="true" />
        <h2 className="mt-3 text-xl font-bold">{t("appointment.successTitle")}</h2>
        <p className="mt-2 text-muted">{t("appointment.successBody", { doctor: doctorName })}</p>
        <p className="mt-4 text-sm text-muted">{t("appointment.reference")}</p>
        <p className="text-2xl font-extrabold tracking-wide text-primary">{state.reference}</p>
        {phone && (
          <a
            href={telHref(phone)}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold hover:bg-surface-alt"
          >
            <IconPhone size={16} aria-hidden="true" />
            {t("appointment.callNow", { number: phone })}
          </a>
        )}
        <p className="mt-4">
          <a href="/doctors" className="text-sm font-semibold text-primary hover:underline">
            {t("appointment.backToDoctors")}
          </a>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="doctorId" value={doctorId} />
      {/* Honeypot — see requestAppointmentAction */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor="patientName" className={labelClass}>
          {t("appointment.name")}
        </label>
        <input id="patientName" name="patientName" required autoComplete="name" defaultValue={v.patientName} className={fieldClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div>
          <label htmlFor="phone" className={labelClass}>
            {t("appointment.phone")}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            defaultValue={v.phone}
            placeholder="01XXXXXXXXX"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="patientAge" className={labelClass}>
            {t("appointment.age")} <span className="font-normal text-muted">({t("appointment.optional")})</span>
          </label>
          <input id="patientAge" name="patientAge" inputMode="numeric" defaultValue={v.patientAge} className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="preferredDate" className={labelClass}>
          {t("appointment.date")}
        </label>
        <input
          id="preferredDate"
          name="preferredDate"
          type="date"
          required
          min={minDate}
          max={maxDate}
          defaultValue={v.preferredDate || minDate}
          className={fieldClass}
        />
        <p className="mt-1 text-xs text-muted">{t("appointment.dateHelp")}</p>
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          {t("appointment.notes")} <span className="font-normal text-muted">({t("appointment.optional")})</span>
        </label>
        <textarea id="notes" name="notes" rows={3} defaultValue={v.notes} placeholder={t("appointment.notesPlaceholder")} className={fieldClass} />
      </div>

      {state?.error && (
        <p role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground hover:brightness-90 disabled:opacity-60"
      >
        {pending ? t("appointment.sending") : t("appointment.submit")}
      </button>
      <p className="text-center text-xs text-muted">{t("appointment.privacy")}</p>
    </form>
  );
}
