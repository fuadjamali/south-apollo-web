"use server";

import { submitTestimonial } from "@/lib/testimonials";
import { getActiveMemberSession } from "@/lib/memberSession";

export async function submitTestimonialAction(prevState, formData) {
  // Derived server-side, same reasoning as orders/bookings — never trusted from the form.
  const session = await getActiveMemberSession();
  const memberAccountId = session?.id || null;

  const authorName = formData.get("authorName")?.toString().trim() || "";
  const authorEmail = formData.get("authorEmail")?.toString().trim() || "";
  const rating = parseInt(formData.get("rating"), 10);
  const body = formData.get("body")?.toString().trim() || "";

  if (!authorName || !body) {
    return { error: "Name and review are required." };
  }
  if (!rating || rating < 1 || rating > 5) {
    return { error: "Please choose a star rating." };
  }

  try {
    await submitTestimonial({ authorName, authorEmail, rating, body, memberAccountId });
    return { success: true };
  } catch (err) {
    return { error: err.message || "Couldn't submit your review. Please try again." };
  }
}
