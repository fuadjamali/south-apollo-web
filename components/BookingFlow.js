"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAvailableSlotsAction,
  placeBookingAction,
  joinWaitlistAction,
} from "@/app/booking/actions";
import { useT } from "@/components/LocaleContext";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

// Local calendar date, not UTC — toISOString() shifts to UTC, which reads as "yesterday"
// for anyone west of UTC during evening hours.
function todayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Shared by both the booking and waitlist forms below — kept as one small component rather
// than duplicated JSX, since the two forms are siblings (never nested) but want identical
// customer-detail fields.
function CustomerFields({ member }) {
  const t = useT();
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-foreground">{t("booking.fullName")}</label>
        <input
          type="text"
          name="customerName"
          required
          defaultValue={member?.name}
          className={fieldClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">{t("enquiry.email")}</label>
        <input
          type="email"
          name="customerEmail"
          required
          defaultValue={member?.email}
          className={fieldClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">{t("booking.phoneOptional")}</label>
        <input type="tel" name="customerPhone" className={fieldClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">{t("booking.notesOptional")}</label>
        <textarea name="notes" rows={2} className={fieldClass} />
      </div>
    </>
  );
}

export default function BookingFlow({ services, member }) {
  const t = useT();
  const router = useRouter();
  const [serviceId, setServiceId] = useState(services[0]?.id ? String(services[0].id) : "");
  const [bookingDate, setBookingDate] = useState(todayStr());
  const [startTime, setStartTime] = useState("");
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [state, formAction, pending] = useActionState(placeBookingAction, {});
  const [waitlistState, waitlistFormAction, waitlistPending] = useActionState(
    joinWaitlistAction,
    {}
  );

  useEffect(() => {
    if (state?.success && state?.bookingNumber) {
      router.push(`/booking-confirmation/${state.bookingNumber}`);
    }
    // router is stable across renders; only re-run when the booking actually succeeds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Slots depend on service + date, which live outside React (server-side availability
  // and existing bookings), so re-fetching on change and syncing the result into state
  // here is the correct use of an effect, not a synchronous derivation.
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStartTime("");
    if (!serviceId || !bookingDate) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    getAvailableSlotsAction(serviceId, bookingDate).then((result) => {
      if (!cancelled) {
        setSlots(result);
        setLoadingSlots(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [serviceId, bookingDate]);

  if (services.length === 0) {
    return (
      <p className="mt-10 text-center text-muted">
        {t("booking.noServices")}
      </p>
    );
  }

  const hasSlots = !loadingSlots && slots.length > 0;
  const noSlots = !loadingSlots && slots.length === 0;

  return (
    <>
      {member ? (
        <p className="mt-6 rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm text-foreground">
          {t("booking.asMember")} <span className="font-semibold">{member.name}</span> ({member.email}).{" "}
          {t("booking.savedTo")}{" "}
          <a href="/member/bookings" className="underline">
            {t("booking.yourAccount")}
          </a>
          {t("booking.savedToEnd")}
        </p>
      ) : (
        <p className="mt-6 rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm text-muted">
          {t("booking.asGuest")}{" "}
          <a
            href="/member/login?redirect=/booking"
            className="font-medium text-accent hover:underline"
          >
            {t("membership.logIn")}
          </a>{" "}
          {t("booking.guestHint")}
        </p>
      )}

      {/* Service + date pickers live outside either form below — both forms carry the current
          selection as hidden inputs instead, so switching between "book a slot" and "join the
          waitlist" never means nesting one form inside the other. */}
      <div className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground">{t("booking.service")}</label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className={fieldClass}
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} · {t("booking.minutes", { count: service.duration_minutes })}
                {service.price ? ` · ${service.price}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">{t("booking.date")}</label>
          <input
            type="date"
            min={todayStr()}
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">{t("booking.availableTimes")}</label>
          {loadingSlots ? (
            <p className="mt-2 text-sm text-muted">{t("booking.checking")}</p>
          ) : noSlots ? (
            <p className="mt-2 text-sm text-muted">
              {t("booking.noSlots")}
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setStartTime(slot)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                    startTime === slot
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:bg-surface-alt"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {hasSlots && (
        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="serviceId" value={serviceId} />
          <input type="hidden" name="bookingDate" value={bookingDate} />
          <input type="hidden" name="startTime" value={startTime} />

          <CustomerFields member={member} />

          {state?.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending || !startTime}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >
            {pending
              ? t("booking.booking")
              : startTime
                ? t("booking.bookTime", { time: startTime })
                : t("booking.chooseTime")}
          </button>
        </form>
      )}

      {noSlots &&
        (waitlistState?.success ? (
          <p className="mt-6 rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm text-foreground">
            {t("booking.waitlistJoined")}
          </p>
        ) : (
          <form action={waitlistFormAction} className="mt-6 space-y-4">
            <input type="hidden" name="serviceId" value={serviceId} />
            <input type="hidden" name="preferredDate" value={bookingDate} />

            <CustomerFields member={member} />

            {waitlistState?.error && (
              <p className="text-sm text-red-600 dark:text-red-400">{waitlistState.error}</p>
            )}

            <button
              type="submit"
              disabled={waitlistPending}
              className="w-full rounded-full border border-border py-3 text-sm font-semibold text-foreground hover:bg-surface-alt disabled:opacity-50"
            >
              {waitlistPending ? t("booking.joining") : t("booking.joinWaitlist")}
            </button>
          </form>
        ))}
    </>
  );
}
