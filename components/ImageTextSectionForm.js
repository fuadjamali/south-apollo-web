"use client";

import { useActionState } from "react";
import ImageFileInput from "@/components/ImageFileInput";
import AIAssistantButton from "@/components/AIAssistantButton";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";
const labelClass = "block text-sm font-medium text-foreground";

// Shared admin form for a singleton "image + heading + body, image left or right" section —
// used by /admin/vision-mission and /admin/history (lib/visionMissionInfo.js and
// lib/historyInfo.js), which are otherwise identical in shape. Not written as a generic
// "content section" abstraction beyond that: it takes the specific fields both of these need,
// not a speculative schema for sections that don't exist yet.
export default function ImageTextSectionForm({ data, action, bodyFieldId, aiEnabled }) {
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
        <p className="mt-1 text-xs text-muted">
          Leave this empty to keep the section hidden even while the feature is switched on —
          it only appears on the live site once there&apos;s a body to show.
        </p>
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
        <div className="mt-1 flex gap-4">
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
        </div>
        <p className="mt-1 text-xs text-muted">
          Only matters once an image is set — stacks with the image on top on narrow screens
          either way.
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
