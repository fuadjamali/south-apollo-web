"use server";

import { submitTestimonial } from "@/lib/testimonials";
import { getActiveMemberSession } from "@/lib/memberSession";
import { getT } from "@/lib/i18n/server";

export async function submitTestimonialAction(prevState, formData) {
  // Derived server-side, same reasoning as orders/bookings — never trusted from the form.
  const [session, { t }] = await Promise.all([getActiveMemberSession(), getT()]);
  const memberAccountId = session?.id || null;

  const authorName = formData.get("authorName")?.toString().trim() || "";
  const authorEmail = formData.get("authorEmail")?.toString().trim() || "";
  const rating = parseInt(formData.get("rating"), 10);
  const body = formData.get("body")?.toString().trim() || "";

  if (!authorName || !body) {
    return { error: t("review.errorRequired") };
  }
  if (!rating || rating < 1 || rating > 5) {
    return { error: t("review.errorRating") };
  }

  try {
    await submitTestimonial({ authorName, authorEmail, rating, body, memberAccountId });
    return { success: true };
  } catch {
    return { error: t("review.errorSubmit") };
  }
}
