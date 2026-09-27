"use client";

import { useActionState } from "react";
import { updateHealthCheckupPageAction } from "@/app/admin/(protected)/health-packages/actions";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";
const labelClass = "block text-sm font-medium text-foreground";

// The text around the packages on /health-checkup. Sections with nothing filled in are hidden
// on the page, so any of them can be dropped by clearing its fields.
export default function HealthCheckupPageForm({ page }) {
  const [state, formAction, pending] = useActionState(updateHealthCheckupPageAction, {});

  return (
    <form action={formAction} className="mt-6 space-y-6">
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Top of page</legend>
        <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
          <div>
            <label className={labelClass}>Small line above heading</label>
            <input
              type="text"
              name="eyebrow"
              defaultValue={page.eyebrow || ""}
              placeholder="Since 2002"
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Heading</label>
            <input
              type="text"
              name="heading"
              required
              defaultValue={page.heading}
              className={fieldClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Introduction</label>
          <textarea name="intro" rows={3} defaultValue={page.intro || ""} className={fieldClass} />
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t border-border pt-6">
        <legend className="text-sm font-semibold text-foreground">Health awareness</legend>
        <div>
          <label className={labelClass}>Heading</label>
          <input
            type="text"
            name="awarenessHeading"
            defaultValue={page.awareness_heading || ""}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Text</label>
          <textarea
            name="awarenessBody"
            rows={4}
            defaultValue={page.awareness_body || ""}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Highlighted quote</label>
          <textarea name="quote" rows={2} defaultValue={page.quote || ""} className={fieldClass} />
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t border-border pt-6">
        <legend className="text-sm font-semibold text-foreground">Why choose us</legend>
        <div>
          <label className={labelClass}>Heading</label>
          <input
            type="text"
            name="whyHeading"
            defaultValue={page.why_heading || ""}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Points</label>
          <textarea
            name="whyItems"
            rows={5}
            defaultValue={page.why_items || ""}
            placeholder={"Expert Medical Team: Highly experienced professionals.\nReliable Service: Fast, dependable reports."}
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-muted">
            One point per line as <span className="font-mono">Title: description</span>. Each
            becomes a card with an icon.
          </p>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t border-border pt-6">
        <legend className="text-sm font-semibold text-foreground">Appointment contacts</legend>
        <div>
          <label className={labelClass}>Heading</label>
          <input
            type="text"
            name="contactHeading"
            defaultValue={page.contact_heading || ""}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Text</label>
          <input
            type="text"
            name="contactIntro"
            defaultValue={page.contact_intro || ""}
            className={fieldClass}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Hotline</label>
            <input
              type="text"
              name="hotline"
              defaultValue={page.hotline || ""}
              placeholder="09617-888892"
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Mobile numbers</label>
            <input
              type="text"
              name="mobiles"
              defaultValue={page.mobiles || ""}
              placeholder="01706-354974, 01711-457444"
              className={fieldClass}
            />
            <p className="mt-1 text-xs text-muted">Separate numbers with commas.</p>
          </div>
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save page text"}
        </button>
        {state?.success && <p className="text-xs text-green-600 dark:text-green-400">{state.success}</p>}
        {state?.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
      </div>
    </form>
  );
}
