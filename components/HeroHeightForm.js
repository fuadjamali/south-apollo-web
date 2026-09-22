"use client";

import { useActionState, useState } from "react";
import { updateHeroSettingsAction } from "@/app/admin/(protected)/hero/actions";

const fieldClass =
  "mt-1 w-40 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

// The hero graphical preview is a scaled-down mock of the page (a thin browser-chrome bar, then
// the hero box) rather than the real HeroCarousel — showing the actual carousel here would mean
// duplicating its autoplay/media logic for a settings field that only cares about one number.
// The box's height is exact relative to PREVIEW_WIDTH_PX; heights taller than the preview's own
// budget are simply shown at a smaller scale (with the real px value always printed alongside)
// rather than clipped, so a very tall hero still previews as "tall," just not 1:1.
const PREVIEW_WIDTH_PX = 360;
const PREVIEW_MAX_HEIGHT_PX = 220;
const DEFAULT_PREVIEW_HEIGHT_PX = 130; // roughly what "auto" looks like on a typical slide

export default function HeroHeightForm({ settings }) {
  const [state, formAction, pending] = useActionState(updateHeroSettingsAction, {});
  const [heightPx, setHeightPx] = useState(settings.height_px ?? "");

  const numericHeight = Number(heightPx);
  const previewHeight =
    heightPx !== "" && Number.isFinite(numericHeight) && numericHeight > 0
      ? numericHeight
      : DEFAULT_PREVIEW_HEIGHT_PX;
  const scale = Math.min(1, PREVIEW_MAX_HEIGHT_PX / previewHeight);

  return (
    <form action={formAction} className="rounded-lg border border-border bg-surface-alt p-4">
      <div className="flex flex-wrap items-start gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground">Hero height</label>
          <input
            type="number"
            name="heightPx"
            min={1}
            placeholder="Auto"
            value={heightPx}
            onChange={(e) => setHeightPx(e.target.value)}
            className={fieldClass}
          />
          <p className="mt-1 max-w-xs text-xs text-muted">
            In pixels. Leave blank for the default — the hero simply grows to fit its heading,
            subheading, and buttons.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save height"}
          </button>
          {state?.success && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">{state.success}</p>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-muted">Preview</p>
          <div
            className="mt-1 overflow-hidden rounded-lg border border-border bg-background shadow-sm"
            style={{ width: PREVIEW_WIDTH_PX }}
          >
            <div className="flex h-5 items-center gap-1 border-b border-border bg-surface-alt px-2">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              <span className="h-2 w-2 rounded-full bg-green-400" />
            </div>
            <div
              className="flex items-center justify-center bg-gradient-to-br from-[#c7dcff] to-[#93b8f5] text-xs font-medium text-white"
              style={{ height: previewHeight * scale }}
            >
              Hero
            </div>
          </div>
          <p className="mt-1 text-xs text-muted">
            {heightPx !== "" && numericHeight > 0 ? `${numericHeight}px` : "Auto (approximate)"}
          </p>
        </div>
      </div>
    </form>
  );
}
