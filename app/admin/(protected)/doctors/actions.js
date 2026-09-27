"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctor,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
} from "@/lib/doctors";
import { uploadImage, deleteImage } from "@/lib/blob";
import { APPOINTMENT_STATUSES, updateAppointment } from "@/lib/doctorAppointments";

const TEXT_FIELDS = [
  "name_en",
  "name_bn",
  "degrees_en",
  "degrees_bn",
  "designation_en",
  "designation_bn",
  "expertise_en",
  "expertise_bn",
  "schedule_en",
  "schedule_bn",
  "keywords_en",
  "keywords_bn",
  "room",
  "serial_phone",
];

function readDoctorForm(formData) {
  const data = {};
  for (const field of TEXT_FIELDS) data[field] = formData.get(field)?.toString().trim() || "";
  const fee = formData.get("fee")?.toString().replace(/[,\s৳]|tk|taka|\/-/gi, "") || "";
  data.fee = fee === "" ? null : /^\d+$/.test(fee) ? parseInt(fee, 10) : NaN;
  data.specialty_id = parseInt(formData.get("specialty_id"), 10) || null;
  data.display_order = parseInt(formData.get("display_order"), 10) || 0;
  data.active = formData.get("active") === "on";
  data.telehealth = formData.get("telehealth") === "on";
  return data;
}

function validateDoctor(data) {
  if (!data.name_en && !data.name_bn) return "Enter the doctor's name in English or Bangla.";
  if (Number.isNaN(data.fee)) return "Fee must be a whole number (or left blank).";
  return null;
}

function refresh() {
  revalidatePath("/doctors");
  revalidatePath("/admin/doctors");
}

export async function createDoctorAction(prevState, formData) {
  const data = readDoctorForm(formData);
  const error = validateDoctor(data);
  if (error) return { error };

  try {
    data.photo = await uploadImage(formData.get("photoFile"), "doctors");
  } catch (err) {
    return { error: err.message };
  }

  await createDoctor(data);
  refresh();
  redirect("/admin/doctors");
}

export async function updateDoctorAction(id, prevState, formData) {
  const data = readDoctorForm(formData);
  const error = validateDoctor(data);
  if (error) return { error };

  const existing = await getDoctor(id);
  let uploaded;
  try {
    uploaded = await uploadImage(formData.get("photoFile"), "doctors");
  } catch (err) {
    return { error: err.message };
  }
  if (uploaded) {
    await deleteImage(existing?.photo);
    data.photo = uploaded;
  } else if (formData.get("removePhoto") === "on") {
    await deleteImage(existing?.photo);
    data.photo = null;
  } else {
    data.photo = existing?.photo || null;
  }

  await updateDoctor(id, data);
  refresh();
  redirect("/admin/doctors");
}

export async function deleteDoctorAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  const existing = await getDoctor(id);
  await deleteDoctor(id);
  await deleteImage(existing?.photo);
  refresh();
  redirect("/admin/doctors");
}

// ---------- Specialties ----------

function readSpecialtyForm(formData) {
  const field = (name) => formData.get(name)?.toString().trim() || "";
  return {
    nameEn: field("nameEn"),
    nameBn: field("nameBn"),
    keywordsEn: field("keywordsEn"),
    keywordsBn: field("keywordsBn"),
    displayOrder: parseInt(formData.get("displayOrder"), 10) || 0,
  };
}

export async function createSpecialtyAction(prevState, formData) {
  const data = readSpecialtyForm(formData);
  if (!data.nameEn) return { error: "Enter the specialty name in English." };
  await createSpecialty(data);
  refresh();
  redirect("/admin/doctors/specialties");
}

export async function updateSpecialtyAction(id, prevState, formData) {
  const data = readSpecialtyForm(formData);
  if (!data.nameEn) return { error: "Enter the specialty name in English." };
  await updateSpecialty(id, data);
  refresh();
  redirect("/admin/doctors/specialties");
}

export async function deleteSpecialtyAction(formData) {
  const id = formData.get("id");
  if (!id) return;
  await deleteSpecialty(id);
  refresh();
  redirect("/admin/doctors/specialties");
}

// ---------- Appointment requests ----------

export async function updateAppointmentAction(formData) {
  const id = parseInt(formData.get("id"), 10);
  const status = formData.get("status")?.toString() || "";
  const staffNote = formData.get("staffNote")?.toString().trim().slice(0, 500) || "";
  if (!id || !APPOINTMENT_STATUSES.includes(status)) return;
  await updateAppointment(id, { status, staffNote });
  revalidatePath("/admin/doctors/appointments");
  revalidatePath("/admin/doctors");
}
