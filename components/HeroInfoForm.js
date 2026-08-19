"use client";

import { useActionState } from "react";
import { updateHeroInfoAction } from "@/app/admin/(protected)/hero/actions";
import ImageFileInput from "@/components/ImageFileInput";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";
const labelClass = "block text-sm font-medium text-foreground";

export default function HeroInfoForm({ hero }) {
  const [state, formAction, pending] = useActionState(updateHeroInfoAction, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label className={labelClass}>Heading</label>
        <textarea
          name="heading"
          rows={2}
          required
          defaultValue={hero.heading || ""}
          className={fieldClass}
        />
        <p className="mt-1 text-xs text-muted">
          Two short statements separated by &quot;. &quot; render as two lines automatically.
        </p>
      </div>

      <div>
        <label className={labelClass}>Subheading</label>
        <textarea
          name="subheading"
          rows={2}
          defaultValue={hero.subheading || ""}
          className={fieldClass}
        />
      </div>

      <ImageFileInput
        name="backgroundImageFile"
        label="Background image"
        currentImage={hero.background_image}
        previewClassName="mt-2 h-32 w-full rounded-lg border border-border object-cover"
        helpText="Rendered behind the heading with a theme-color overlay so text stays legible."
      />
      {hero.background_image && (
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="removeBackgroundImage" className="h-4 w-4 rounded border-border" />
          Remove the background image (falls back to a plain background)
        </label>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Overlay strength</label>
          <select
            name="overlayStrength"
            defaultValue={hero.overlay_strength || "medium"}
            className={fieldClass}
          >
            <option value="light">Light</option>
            <option value="medium">Medium</option>
            <option value="dark">Dark</option>
          </select>
          <p className="mt-1 text-xs text-muted">
            How strong the scrim over the image is. Turn it up if a new image makes the text
            harder to read.
          </p>
        </div>
        <div>
          <label className={labelClass}>Text colour</label>
          <select name="textStyle" defaultValue={hero.text_style || "auto"} className={fieldClass}>
            <option value="auto">Auto (matches site theme)</option>
            <option value="light">Always light</option>
            <option value="dark">Always dark</option>
          </select>
          <p className="mt-1 text-xs text-muted">
            Only override this if the overlay alone isn&apos;t enough contrast — Auto already
            adapts to every colour theme and dark mode.
          </p>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h2 className="text-sm font-semibold text-foreground">Buttons</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Primary button label</label>
            <input
              type="text"
              name="primaryCtaLabel"
              defaultValue={hero.primary_cta_label || ""}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Primary button link</label>
            <input
              type="text"
              name="primaryCtaHref"
              defaultValue={hero.primary_cta_href || ""}
              placeholder="#products"
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Secondary button label</label>
            <input
              type="text"
              name="secondaryCtaLabel"
              defaultValue={hero.secondary_cta_label || ""}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Secondary button link</label>
            <input
              type="text"
              name="secondaryCtaHref"
              defaultValue={hero.secondary_cta_href || ""}
              placeholder="#contact-info"
              className={fieldClass}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          Links can be a page anchor (e.g. <code>#products</code>) or a full URL.
        </p>
      </div>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600 dark:text-green-400">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
