"use client";

import { useState } from "react";
import ImageFileInput from "@/components/ImageFileInput";
import VideoFileInput from "@/components/VideoFileInput";
import NavDestinationField from "@/components/NavDestinationField";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";
const labelClass = "block text-sm font-medium text-foreground";

// One slide's full editor — used by both /admin/hero/new and /admin/hero/[id]/edit. `slide` is
// null on the create page. Reordering, activating, and deleting all happen from the list page
// (app/admin/(protected)/hero/page.js) instead, same split as Products.
export default function HeroSlideForm({ slide, action, submitLabel = "Save" }) {
  const [mediaType, setMediaType] = useState(slide?.media_type || "image");
  const [focalPosition, setFocalPosition] = useState(slide?.focal_position ?? 50);

  // The desktop background is what the slider previews — the mobile alternate image (when set)
  // gets the same focal_position applied too (see HeroCarousel.js's SlideMedia), but the single-
  // image-no-mobile-variant fallback deliberately ignores it below sm: (object-bottom, a fixed
  // anti-collision measure), so there's nothing meaningfully different to preview for mobile.
  const previewSrc = mediaType === "video" ? slide?.background_video : slide?.background_image;
  const previewIsVideo = mediaType === "video";

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label className={labelClass}>Heading</label>
        <textarea
          name="heading"
          rows={2}
          required
          defaultValue={slide?.heading || ""}
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
          defaultValue={slide?.subheading || ""}
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Background</label>
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={() => setMediaType("image")}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
              mediaType === "image"
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-foreground hover:bg-surface-alt"
            }`}
          >
            Image
          </button>
          <button
            type="button"
            onClick={() => setMediaType("video")}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
              mediaType === "video"
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-foreground hover:bg-surface-alt"
            }`}
          >
            Video
          </button>
        </div>
        <input type="hidden" name="mediaType" value={mediaType} />
      </div>

      {mediaType === "image" ? (
        <>
          <ImageFileInput
            name="backgroundImageFile"
            label="Background image"
            currentImage={slide?.background_image}
            previewClassName="mt-2 h-32 w-full rounded-lg border border-border object-cover"
            helpText="Rendered behind the heading with a theme-color overlay so text stays legible."
          />
          {slide?.background_image && (
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                name="removeBackgroundImage"
                className="h-4 w-4 rounded border-border"
              />
              Remove the background image (falls back to a plain background)
            </label>
          )}

          <ImageFileInput
            name="backgroundImageMobileFile"
            label="Mobile background image (optional)"
            currentImage={slide?.background_image_mobile}
            previewClassName="mt-2 h-40 w-24 rounded-lg border border-border object-cover"
            cropAspectRatio="4:5"
            helpText="A portrait crop of the same scene, shown on phones instead of the background image above. Leave blank to keep using the background image on mobile too."
          />
          {slide?.background_image_mobile && (
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                name="removeBackgroundImageMobile"
                className="h-4 w-4 rounded border-border"
              />
              Remove the mobile image (phones fall back to the background image above)
            </label>
          )}
        </>
      ) : (
        <>
          <VideoFileInput
            name="backgroundVideoFile"
            label="Background video"
            currentVideo={slide?.background_video}
            helpText="A short, muted, looping clip — plays automatically and fills the same space the background image would."
          />
          {slide?.background_video && (
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                name="removeBackgroundVideo"
                className="h-4 w-4 rounded border-border"
              />
              Remove the background video
            </label>
          )}
        </>
      )}

      <div>
        <label className={labelClass}>Vertical focus</label>
        {previewSrc ? (
          <>
            <div className="mt-1 h-56 w-full overflow-hidden rounded-lg border border-border bg-gray-100 dark:bg-gray-800">
              {previewIsVideo ? (
                <video
                  src={previewSrc}
                  muted
                  autoPlay
                  loop
                  playsInline
                  style={{ objectPosition: `center ${focalPosition}%` }}
                  className="h-full w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewSrc}
                  alt=""
                  style={{ objectPosition: `center ${focalPosition}%` }}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <input
              type="range"
              name="focalPosition"
              min={0}
              max={100}
              value={focalPosition}
              onChange={(e) => setFocalPosition(Number(e.target.value))}
              className="mt-2 w-full"
            />
            <p className="mt-1 text-xs text-muted">
              Which part of the {previewIsVideo ? "video" : "image"} stays in view once it&apos;s
              cropped to the hero&apos;s height — 0% keeps the top in view, 100% keeps the
              bottom. Currently {focalPosition}%.
            </p>
          </>
        ) : (
          <>
            <input type="hidden" name="focalPosition" value={focalPosition} />
            <p className="mt-1 text-xs text-muted">
              Upload and save a background {mediaType} above first — you can come back here
              afterwards to preview and fine-tune which part of it stays in view.
            </p>
          </>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Overlay strength</label>
          <select
            name="overlayStrength"
            defaultValue={slide?.overlay_strength || "medium"}
            className={fieldClass}
          >
            <option value="light">Light</option>
            <option value="medium">Medium</option>
            <option value="dark">Dark</option>
          </select>
          <p className="mt-1 text-xs text-muted">
            How strong the scrim over the background is. Turn it up if the text is hard to read.
          </p>
        </div>
        <div>
          <label className={labelClass}>Text colour</label>
          <select name="textStyle" defaultValue={slide?.text_style || "auto"} className={fieldClass}>
            <option value="auto">Auto (matches site theme)</option>
            <option value="light">Always light</option>
            <option value="dark">Always dark</option>
          </select>
          <p className="mt-1 text-xs text-muted">
            Only override this if the overlay alone isn&apos;t enough contrast.
          </p>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h2 className="text-sm font-semibold text-foreground">Buttons</h2>
        <div className="mt-3 space-y-4">
          <div className="flex flex-wrap items-start gap-2">
            <div className="min-w-[9rem] flex-1">
              <label className={labelClass}>Primary button label</label>
              <input
                type="text"
                name="primaryCtaLabel"
                defaultValue={slide?.primary_cta_label || ""}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Primary button link</label>
              <NavDestinationField
                name="primaryCtaHref"
                defaultValue={slide?.primary_cta_href || ""}
                required={false}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-start gap-2">
            <div className="min-w-[9rem] flex-1">
              <label className={labelClass}>Secondary button label</label>
              <input
                type="text"
                name="secondaryCtaLabel"
                defaultValue={slide?.secondary_cta_label || ""}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Secondary button link</label>
              <NavDestinationField
                name="secondaryCtaHref"
                defaultValue={slide?.secondary_cta_href || ""}
                required={false}
              />
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          A button only appears on this slide once it has a label — leave the label blank to skip
          it.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="active"
          defaultChecked={slide?.active !== false}
          className="h-4 w-4 rounded border-border"
        />
        Active — shown in the carousel on the live site
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          {submitLabel}
        </button>
        <a
          href="/admin/hero"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-alt"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
