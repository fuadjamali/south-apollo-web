"use client";

import { useActionState, useRef } from "react";
import { setAllFeaturesAction } from "@/app/admin/(protected)/features/actions";

// Single toggle switch, same visual language as FeatureToggleRow. `allEnabled` reflects whether
// every non-locked module + Contact Us is currently on — checked means "all on", and clicking
// flips to the opposite of whatever that current aggregate state is.
export default function BulkFeatureToggle({ allEnabled }) {
  const [, formAction, pending] = useActionState(setAllFeaturesAction, {});
  const formRef = useRef(null);

  return (
    <form ref={formRef} action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="enabled" value={allEnabled ? "off" : "on"} />
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">All</span>
      <label
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          pending ? "cursor-wait opacity-50" : "cursor-pointer"
        } ${allEnabled ? "bg-primary" : "bg-border"}`}
      >
        <input
          type="checkbox"
          checked={allEnabled}
          disabled={pending}
          readOnly
          className="peer sr-only"
          onClick={() => formRef.current?.requestSubmit()}
        />
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            allEnabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </label>
    </form>
  );
}
