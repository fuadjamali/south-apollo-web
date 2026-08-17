"use server";

import { getAvailableSlots, createBooking } from "@/lib/bookings";
import { joinWaitlist } from "@/lib/bookingWaitlist";
import { getActiveMemberSession } from "@/lib/memberSession";

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
  const session = await getActiveMemberSession();
  const memberAccountId = session?.id || null;

  const serviceId = formData.get("serviceId")?.toString() || "";
  const bookingDate = formData.get("bookingDate")?.toString() || "";
  const startTime = formData.get("startTime")?.toString() || "";
  const customerName = formData.get("customerName")?.toString().trim() || "";
  const customerEmail = formData.get("customerEmail")?.toString().trim() || "";
  const customerPhone = formData.get("customerPhone")?.toString().trim() || "";
  const notes = formData.get("notes")?.toString().trim() || "";

  if (!serviceId || !bookingDate || !startTime) {
    return { error: "Please choose a service, date, and time." };
  }
  if (!customerName || !customerEmail) {
    return { error: "Name and email are required." };
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
    return { error: err.message || "Couldn't place your booking. Please try again." };
  }
}

export async function joinWaitlistAction(prevState, formData) {
  const session = await getActiveMemberSession();
  const memberAccountId = session?.id || null;

  const serviceId = formData.get("serviceId")?.toString() || "";
  const preferredDate = formData.get("preferredDate")?.toString() || "";
  const customerName = formData.get("customerName")?.toString().trim() || "";
  const customerEmail = formData.get("customerEmail")?.toString().trim() || "";
  const customerPhone = formData.get("customerPhone")?.toString().trim() || "";
  const notes = formData.get("notes")?.toString().trim() || "";

  if (!serviceId || !preferredDate) {
    return { error: "Please choose a service and date." };
  }
  if (!customerName || !customerEmail) {
    return { error: "Name and email are required." };
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
    return { error: err.message || "Couldn't join the waitlist. Please try again." };
  }
}
