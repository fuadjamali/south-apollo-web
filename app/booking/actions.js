"use server";

import { getAvailableSlots, createBooking } from "@/lib/bookings";
import { joinWaitlist } from "@/lib/bookingWaitlist";
import { getActiveMemberSession } from "@/lib/memberSession";
import { getT } from "@/lib/i18n/server";

// lib/bookings.js / lib/bookingWaitlist.js throw these for the visitor to see; anything else is
// an unexpected failure and gets the generic message.
const KNOWN_ERRORS = {
  "That service is no longer available.": "booking.errorServiceGone",
  "That service isn't available.": "booking.errorServiceGone",
  "That time slot is no longer available. Please choose another.": "booking.errorSlotTaken",
};

export async function getAvailableSlotsAction(serviceId, dateStr) {
  if (!serviceId || !dateStr) return [];
  try {
    return await getAvailableSlots(serviceId, dateStr);
  } catch {
    return [];
  }
}

export async function placeBookingAction(prevState, formData) {
  // Derived from the session cookie server-side, never from the submitted form — same
  // reasoning as checkout: a guest could otherwise attach a booking to any member account.
  const [session, { t }] = await Promise.all([getActiveMemberSession(), getT()]);
  const memberAccountId = session?.id || null;

  const serviceId = formData.get("serviceId")?.toString() || "";
  const bookingDate = formData.get("bookingDate")?.toString() || "";
  const startTime = formData.get("startTime")?.toString() || "";
  const customerName = formData.get("customerName")?.toString().trim() || "";
  const customerEmail = formData.get("customerEmail")?.toString().trim() || "";
  const customerPhone = formData.get("customerPhone")?.toString().trim() || "";
  const notes = formData.get("notes")?.toString().trim() || "";

  if (!serviceId || !bookingDate || !startTime) {
    return { error: t("booking.errorPickSlot") };
  }
  if (!customerName || !customerEmail) {
    return { error: t("booking.errorNameEmail") };
  }

  try {
    const booking = await createBooking({
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      bookingDate,
      startTime,
      memberAccountId,
    });
    return { success: true, bookingNumber: booking.bookingNumber };
  } catch (err) {
    return { error: t(KNOWN_ERRORS[err.message] || "booking.errorBook") };
  }
}

export async function joinWaitlistAction(prevState, formData) {
  const [session, { t }] = await Promise.all([getActiveMemberSession(), getT()]);
  const memberAccountId = session?.id || null;

  const serviceId = formData.get("serviceId")?.toString() || "";
  const preferredDate = formData.get("preferredDate")?.toString() || "";
  const customerName = formData.get("customerName")?.toString().trim() || "";
  const customerEmail = formData.get("customerEmail")?.toString().trim() || "";
  const customerPhone = formData.get("customerPhone")?.toString().trim() || "";
  const notes = formData.get("notes")?.toString().trim() || "";

  if (!serviceId || !preferredDate) {
    return { error: t("booking.errorPickDate") };
  }
  if (!customerName || !customerEmail) {
    return { error: t("booking.errorNameEmail") };
  }

  try {
    await joinWaitlist({
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      preferredDate,
      notes,
      memberAccountId,
    });
    return { success: true };
  } catch (err) {
    return { error: t(KNOWN_ERRORS[err.message] || "booking.errorWaitlist") };
  }
}
