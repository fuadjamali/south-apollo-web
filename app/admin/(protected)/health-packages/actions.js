"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createPackage,
  updatePackage,
  deletePackage,
  getPackage,
  updateHealthCheckupPage,
} from "@/lib/healthPackages";
import { uploadImage, deleteImage } from "@/lib/blob";

// "7,050", "BDT 7050/-", "7050" → 7050. Empty → null. Anything else non-numeric → NaN.
function parseAmount(value) {
  const raw = value?.toString().trim() || "";
  if (!raw) return null;
  const digits = raw.replace(/bdt|tk|taka|\/-|[,\s৳]/gi, "");
  return /^\d+$/.test(digits) ? parseInt(digits, 10) : NaN;
}

function readPackageForm(formData) {
  return {
    name: formData.get("name")?.toString().trim() || "",
    description: formData.get("description")?.toString().trim() || "",
    previousPrice: parseAmount(formData.get("previousPrice")),
    price: parseAmount(formData.get("price")),
    tests: formData.get("tests")?.toString().trim() || "",
    displayOrder: parseInt(formData.get("displayOrder"), 10) || 0,
    active: formData.get("active") === "on",
  };
}

function validatePackage(data) {
  if (!data.name) return "Package name is required.";
  if (data.price === null || Number.isNaN(data.price)) {
    return "Enter the package price as a whole number, e.g. 4230 or 4,230.";
  }
  if (Number.isNaN(data.previousPrice)) {
    return "Previous price must be a whole number (or left blank).";
  }
  return null;
}

function refresh() {
  revalidatePath("/health-checkup");
  revalidatePath("/admin/health-packages");
}

export async function createPackageAction(prevState, formData) {
  const data = readPackageForm(formData);
  const error = validatePackage(data);
  if (error) return { error };

  try {
    data.image = await uploadImage(formData.get("imageFile"), "health-packages");
  } catch (err) {
    return { error: err.message };
  }

  await createPackage(data);
  refresh();
  redirect("/admin/health-packages");
}

export async function updatePackageAction(id, prevState, formData) {
  const data = readPackageForm(formData);
  const error = validatePackage(data);
  if (error) return { error };

  const existing = await getPackage(id);
  let uploaded;
  try {
    uploaded = await uploadImage(formData.get("imageFile"), "health-packages");
  } catch (err) {
    return { error: err.message };
  }
  if (uploaded) {
    await deleteImage(existing?.image);
    data.image = uploaded;
  } else if (formData.get("removeImage") === "on") {
    await deleteImage(existing?.image);
    data.image = null;
  } else {
    data.image = existing?.image || null;
  }

  await updatePackage(id, data);
  refresh();
  redirect("/admin/health-packages");
}

export async function deletePackageAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  const existing = await getPackage(id);
  await deletePackage(id);
  await deleteImage(existing?.image);
  refresh();
  redirect("/admin/health-packages");
}

export async function updateHealthCheckupPageAction(prevState, formData) {
  const field = (name) => formData.get(name)?.toString().trim() || "";
  const heading = field("heading");
  if (!heading) return { error: "Page heading can't be empty." };

  await updateHealthCheckupPage({
    eyebrow: field("eyebrow"),
    heading,
    intro: field("intro"),
    awarenessHeading: field("awarenessHeading"),
    awarenessBody: field("awarenessBody"),
    quote: field("quote"),
    whyHeading: field("whyHeading"),
    whyItems: field("whyItems"),
    contactHeading: field("contactHeading"),
    contactIntro: field("contactIntro"),
    hotline: field("hotline"),
    mobiles: field("mobiles"),
  });
  refresh();
  return { success: "Page text saved." };
}
