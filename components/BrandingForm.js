"use client";

import { useActionState } from "react";
import { updateBrandingAction } from "@/app/admin/(protected)/logo/actions";
import ImageFileInput from "@/components/ImageFileInput";

export default function BrandingForm({ branding }) {
  const [state, formAction, pending] = useActionState(updateBrandingAction, {});

  return (
    <form action={formAction} className="mt-6 space-y-6">
      <ImageFileInput
        name="logoFile"
        label="Logo"
        currentImage={branding.logo_url}
        previewClassName="mt-2 h-14 w-14 rounded-lg border border-border object-contain bg-surface-alt p-1"
        helpText="Shown in the header and footer across the whole site. Falls back to the default mark if none is uploaded."
      />
      {branding.logo_url && (
        <label className="-mt-3 flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="removeLogo" className="h-4 w-4 rounded border-border" />
          Remove the logo (falls back to the default mark)
        </label>
      )}

      <div className="border-t border-border pt-6">
        <ImageFileInput
          name="faviconFile"
          label="Favicon"
          currentImage={branding.favicon_url}
          previewClassName="mt-2 h-8 w-8 rounded border border-border object-contain bg-surface-alt p-0.5"
          helpText="The icon shown in the browser tab. Square images work best (e.g. 32×32 or 512×512) — .ico, .png, or .svg."
        />
        {branding.favicon_url && (
          <label className="-mt-3 flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" name="removeFavicon" className="h-4 w-4 rounded border-border" />
            Remove the favicon (falls back to the default)
          </label>
        )}
      </div>

      <div className="border-t border-border pt-6">
        <ImageFileInput
          name="appleIconFile"
          label="Apple touch icon"
          currentImage={branding.apple_icon_url}
          previewClassName="mt-2 h-14 w-14 rounded-xl border border-border object-contain bg-surface-alt p-1"
          helpText="Shown when someone adds the site to their iPhone/iPad home screen. Square, ideally 180×180."
        />
        {branding.apple_icon_url && (
          <label className="-mt-3 flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" name="removeAppleIcon" className="h-4 w-4 rounded border-border" />
            Remove the apple touch icon
          </label>
        )}
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
