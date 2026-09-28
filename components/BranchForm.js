"use client";

import { useActionState } from "react";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";
const labelClass = "block text-sm font-medium text-foreground";

function Pair({ label, name, branch, rows, required, placeholderEn, placeholderBn }) {
  const Field = rows ? "textarea" : "input";
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[
        ["en", "English", placeholderEn],
        ["bn", "বাংলা", placeholderBn],
      ].map(([lang, langLabel, placeholder]) => (
        <div key={lang}>
          <label className={labelClass}>
            {label} <span className="font-normal text-muted">({langLabel})</span>
          </label>
          <Field
            {...(rows ? { rows } : { type: "text" })}
            name={`${name}_${lang}`}
            lang={lang}
            required={required && lang === "en"}
            defaultValue={branch?.[`${name}_${lang}`] || ""}
            placeholder={placeholder}
            className={fieldClass}
          />
        </div>
      ))}
    </div>
  );
}

export default function BranchForm({ action, branch, submitLabel }) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <Pair label="Branch name" name="name" branch={branch} required placeholderEn="Sadar Road Branch" placeholderBn="সদর রোড শাখা" />
      <Pair label="Short intro" name="intro" branch={branch} rows={3} />
      <Pair label="Address" name="address" branch={branch} rows={2} />

      <div>
        <label className={labelClass}>Phone numbers</label>
        <textarea
          name="phones"
          rows={3}
          defaultValue={branch?.phones || ""}
          placeholder={"Hotline: 09617-888892\nTel: 02478865536\nMobile: 01711-457444, 01706-354974"}
          className={fieldClass}
        />
        <p className="mt-1 text-xs text-muted">
          One line per kind of number, as <span className="font-mono">Label: number, number</span> — Hotline, Tel
          and Mobile show in Bangla on the Bangla site. Each number becomes a tap-to-call link.
        </p>
      </div>

      <div>
        <label className={labelClass}>Map search (optional)</label>
        <input
          type="text"
          name="map_query"
          defaultValue={branch?.map_query || ""}
          placeholder="South Apollo Diagnostic Complex, Sadar Road, Barishal"
          className={fieldClass}
        />
        <p className="mt-1 text-xs text-muted">
          What &ldquo;Get directions&rdquo; searches on Google Maps. Blank uses the English address; the clinic&rsquo;s
          own Google Maps name usually lands on the exact spot.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Display order</label>
          <input type="number" name="display_order" defaultValue={branch?.display_order ?? 0} className={fieldClass} />
        </div>
        <label className="mt-7 flex items-center gap-2 text-sm font-medium text-foreground">
          <input type="checkbox" name="is_main" defaultChecked={branch?.is_main} className="h-4 w-4 rounded border-border" />
          Main branch
        </label>
        <label className="mt-7 flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            name="active"
            defaultChecked={branch ? branch.active : true}
            className="h-4 w-4 rounded border-border"
          />
          Show on the website
        </label>
      </div>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <a
          href="/admin/branches"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
