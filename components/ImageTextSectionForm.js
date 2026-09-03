"use client";

import { useActionState } from "react";
import ImageFileInput from "@/components/ImageFileInput";
import AIAssistantButton from "@/components/AIAssistantButton";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";
const labelClass = "block text-sm font-medium text-foreground";

// Shared admin form for a singleton "image + heading + body" section — used by
// /admin/vision-mission, /admin/history, and /admin/about (lib/visionMissionInfo.js,
// lib/historyInfo.js, lib/aboutInfo.js). Every instance gets left/right; `allowBehindPosition`
// additionally offers "behind the text" (full-bleed background, same treatment as the hero
// section) plus the overlay/text-style fields that mode needs to stay legible — About Us is the
// only current caller that passes it, so Vision & Mission and History keep exactly the two
// options they had before this was added.
export default function ImageTextSectionForm({
  data,
  action,
  bodyFieldId,
  aiEnabled,
  allowBehindPosition = false,
  hidesWhenBodyEmpty = true,
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label className={labelClass}>Heading</label>
        <input
          type="text"
          name="heading"
          required
          defaultValue={data.heading || ""}
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Body</label>
        <textarea
          id={bodyFieldId}
          name="body"
          rows={6}
          defaultValue={data.body || ""}
          className={fieldClass}
        />
        {aiEnabled && <AIAssistantButton targetId={bodyFieldId} fieldLabel="section body text" />}
        {hidesWhenBodyEmpty && (
          <p className="mt-1 text-xs text-muted">
            Leave this empty to keep the section hidden even while the feature is switched on —
            it only appears on the live site once there&apos;s a body to show.
          </p>
        )}
      </div>

      <ImageFileInput
        name="imageFile"
        label="Image (optional)"
        currentImage={data.image}
        cropAspectRatio="4:5"
        previewClassName="mt-2 h-40 w-32 rounded-lg border border-border object-cover"
        helpText="Shown beside the text. Leave blank for a text-only section."
      />
      {data.image && (
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="removeImage" className="h-4 w-4 rounded border-border" />
          Remove the image (falls back to text-only)
        </label>
      )}

      <div>
        <span className={labelClass}>Image position</span>
        <div className="mt-1 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="imagePosition"
              value="left"
              defaultChecked={(data.image_position || "left") === "left"}
              className="h-4 w-4 border-border"
            />
            Image on left, text on right
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="imagePosition"
              value="right"
              defaultChecked={data.image_position === "right"}
              className="h-4 w-4 border-border"
            />
            Image on right, text on left
          </label>
          {allowBehindPosition && (
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="imagePosition"
                value="behind"
                defaultChecked={data.image_position === "behind"}
                className="h-4 w-4 border-border"
              />
              Behind the text
            </label>
          )}
        </div>
        <p className="mt-1 text-xs text-muted">
          Only matters once an image is set — stacks with the image on top on narrow screens
          {allowBehindPosition ? ", including when “behind the text” is picked" : ""}.
        </p>
      </div>

      {allowBehindPosition && (
        <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Overlay strength</label>
            <select
              name="overlayStrength"
              defaultValue={data.overlay_strength || "medium"}
              className={fieldClass}
            >
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="dark">Dark</option>
            </select>
            <p className="mt-1 text-xs text-muted">
              Only applies when the image is behind the text — how strong the scrim over it is.
            </p>
          </div>
          <div>
            <label className={labelClass}>Text colour</label>
            <select name="textStyle" defaultValue={data.text_style || "auto"} className={fieldClass}>
              <option value="auto">Auto (matches site theme)</option>
              <option value="light">Always light</option>
              <option value="dark">Always dark</option>
            </select>
            <p className="mt-1 text-xs text-muted">
              Only override this if the overlay alone isn&apos;t enough contrast.
            </p>
          </div>
        </div>
      )}

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
