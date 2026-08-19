"use client";

import { useActionState, useRef } from "react";
import { updateFeatureAction } from "@/app/admin/(protected)/features/actions";

// action/hiddenFields let this same toggle UI drive a different server action for rows that
// aren't backed by module_settings — see the Contact Us row in features/page.js, which is
// backed by contact_info.enabled instead.
export default function FeatureToggleRow({
  moduleKey,
  label,
  enabled,
  locked,
  action = updateFeatureAction,
  hiddenFields = { module: moduleKey },
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const formRef = useRef(null);

  return (
    <form ref={formRef} action={formAction} className="flex items-center justify-between gap-4 py-2.5">
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <div className="min-w-0">
        <p className={`text-sm ${locked ? "text-muted" : "text-foreground"}`}>{label}</p>
        {locked && (
          <p className="text-xs text-muted">Not included in this site&apos;s current plan.</p>
        )}
        {state?.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
      </div>

      <label
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          locked ? "cursor-not-allowed opacity-40" : "cursor-pointer"
        } ${enabled ? "bg-primary" : "bg-border"}`}
      >
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={enabled}
          disabled={locked || pending}
          className="peer sr-only"
          onChange={() => formRef.current?.requestSubmit()}
        />
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </label>
    </form>
  );
}
