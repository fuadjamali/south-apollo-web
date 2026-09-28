"use client";

import { useActionState } from "react";
import ImageFileInput from "@/components/ImageFileInput";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";
const labelClass = "block text-sm font-medium text-foreground";

export default function HealthPackageForm({ action, pkg, submitLabel }) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label className={labelClass}>Package name</label>
        <input
          type="text"
          name="name"
          required
          defaultValue={pkg?.name}
          placeholder="General Health Check-up"
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Short description</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={pkg?.description || ""}
          className={fieldClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Package name <span className="font-normal text-muted">(বাংলা)</span>
          </label>
          <input
            type="text"
            name="nameBn"
            lang="bn"
            defaultValue={pkg?.translations?.bn?.name || ""}
            placeholder="জেনারেল হেলথ চেকআপ"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            Short description <span className="font-normal text-muted">(বাংলা)</span>
          </label>
          <textarea
            name="descriptionBn"
            rows={2}
            lang="bn"
            defaultValue={pkg?.translations?.bn?.description || ""}
            className={fieldClass}
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-muted">
        Optional — blank shows the English on the Bangla site. Test names stay as entered below.
      </p>

      <div>
        <ImageFileInput
          name="imageFile"
          label="Package image"
          currentImage={pkg?.image}
          cropAspectRatio="16:9"
          previewClassName="mt-2 aspect-video w-64 rounded-lg border border-border object-cover"
          helpText={
            pkg?.image
              ? "Shown at the top of the package card. Choose a file to replace it, or leave blank to keep it."
              : "Optional — shown at the top of the package card. A wide (16:9) image works best."
          }
        />
        {pkg?.image && (
          <label className="mt-2 flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" name="removeImage" className="h-4 w-4 rounded border-border" />
            Remove current image
          </label>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Previous price (BDT)</label>
          <input
            type="text"
            inputMode="numeric"
            name="previousPrice"
            defaultValue={pkg?.previous_price ?? ""}
            placeholder="7050"
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-muted">Optional — shown crossed out with the % saved.</p>
        </div>
        <div>
          <label className={labelClass}>Price (BDT)</label>
          <input
            type="text"
            inputMode="numeric"
            name="price"
            required
            defaultValue={pkg?.price ?? ""}
            placeholder="4230"
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-muted">The price the patient pays now.</p>
        </div>
      </div>

      <div>
        <label className={labelClass}>Included tests</label>
        <textarea
          name="tests"
          rows={12}
          defaultValue={pkg?.tests || ""}
          placeholder={"CBC\nLipid Profile\nECG"}
          className={`${fieldClass} font-mono`}
        />
        <p className="mt-1 text-xs text-muted">One test per line, in the order they should appear.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Display order</label>
          <input
            type="number"
            name="displayOrder"
            defaultValue={pkg?.display_order ?? 0}
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-muted">Lower numbers show first.</p>
        </div>
        <label className="mt-7 flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            name="active"
            defaultChecked={pkg ? pkg.active : true}
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
          href="/admin/health-packages"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
