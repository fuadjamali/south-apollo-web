"use server";

import { revalidatePath } from "next/cache";
import { getDoctor } from "@/lib/doctors";
import { createAppointment, countRecentByPhone } from "@/lib/doctorAppointments";
import { getT } from "@/lib/i18n/server";

const MAX_REQUESTS_PER_PHONE_PER_DAY = 3;
const MAX_DAYS_AHEAD = 60;

// Today's date in Bangladesh, whatever timezone the server runs in (Vercel is UTC, six hours
// behind — without this, a patient booking at 2am would be told "today" is in the past).
function todayInDhaka() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date());
}

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Accepts what people actually type — "01711-457444", "+880 1711 457444", Bangla digits — and
// returns the 11-digit local form "01711457444", or null if it isn't a Bangladeshi mobile.
function normalizePhone(value) {
  const digits = (value || "")
    .replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d))
    .replace(/[^\d]/g, "")
    .replace(/^880/, "0")
    .replace(/^88(?=01)/, "");
  return /^01[3-9]\d{8}$/.test(digits) ? digits : null;
}

export async function requestAppointmentAction(prevState, formData) {
  const { t } = await getT();

  // Honeypot: hidden from people, filled in by form-spamming bots. Pretend it worked.
  if (formData.get("website")) return { success: true, reference: "DA-000000-0000" };

  const doctorId = parseInt(formData.get("doctorId"), 10);
  const patientName = formData.get("patientName")?.toString().trim() || "";
  const phone = normalizePhone(formData.get("phone")?.toString());
  const patientAge = formData.get("patientAge")?.toString().trim().slice(0, 20) || "";
  const preferredDate = formData.get("preferredDate")?.toString() || "";
  const notes = formData.get("notes")?.toString().trim().slice(0, 1000) || "";

  // React resets the form after every action, so hand back what was typed and the form puts
  // it back — one mistyped digit mustn't wipe the whole request.
  const values = {
    patientName,
    phone: formData.get("phone")?.toString() || "",
    patientAge,
    preferredDate,
    notes,
  };
  const fail = (key) => ({ error: t(key), values });

  const doctor = doctorId ? await getDoctor(doctorId) : null;
  if (!doctor || !doctor.active) return fail("appointment.errorDoctor");
  if (!patientName) return fail("appointment.errorName");
  if (!phone) return fail("appointment.errorPhone");

  const today = todayInDhaka();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) || preferredDate < today || preferredDate > addDays(today, MAX_DAYS_AHEAD)) {
    return fail("appointment.errorDate");
  }

  if ((await countRecentByPhone(phone)) >= MAX_REQUESTS_PER_PHONE_PER_DAY) {
    return fail("appointment.errorTooMany");
  }

  try {
    const reference = await createAppointment({
      doctorId: doctor.id,
      doctorName: doctor.name_en || doctor.name_bn,
      patientName: patientName.slice(0, 255),
      phone,
      patientAge,
      preferredDate,
      notes,
    });
    revalidatePath("/admin/doctors/appointments");
    return { success: true, reference, preferredDate };
  } catch {
    return fail("appointment.errorGeneric");
  }
}
