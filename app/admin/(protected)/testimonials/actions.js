"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateTestimonial, deleteTestimonial, getTestimonial } from "@/lib/testimonials";

export async function updateTestimonialAction(id, formData) {
  const status = formData.get("status")?.toString() || "";
  const displayOrder = parseInt(formData.get("displayOrder"), 10) || 0;

  await updateTestimonial(id, { status, displayOrder });

  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  revalidatePath(`/admin/testimonials/${id}`);
}

// Quick approve/reject from the list, without disturbing display_order — keeps the list page's
// buttons a single click instead of routing through the detail page's form.
export async function setTestimonialStatusAction(formData) {
  const id = formData.get("id");
  const status = formData.get("status")?.toString() || "";
  if (!id || !status) return;

  const existing = await getTestimonial(id);
  await updateTestimonial(id, { status, displayOrder: existing?.display_order ?? 0 });

  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

export async function deleteTestimonialAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  await deleteTestimonial(id);

  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials");
}
