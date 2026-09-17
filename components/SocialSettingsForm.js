"use client";

import { useActionState } from "react";
import { updateSocialSettingsAction } from "@/app/admin/(protected)/social/actions";
import { SOCIAL_PLATFORMS } from "@/lib/socialPlatforms";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";
const labelClass = "block text-sm font-medium text-foreground";

// Plain checkbox styled as a switch — same visual language as FeatureToggleRow, but part of
// this shared form (submitted together with everything else via the Save button) rather than
// each platform having its own auto-submitting toggle.
function ShowToggle({ name, defaultChecked }) {
  return (
    <label className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="absolute inset-0 rounded-full bg-border transition-colors peer-checked:bg-primary" />
      <span className="absolute left-0.5 h-4 w-4 translate-x-0 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
    </label>
  );
}

export default function SocialSettingsForm({ settings }) {
  const [state, formAction, pending] = useActionState(updateSocialSettingsAction, {});

  return (
    <form action={formAction} className="mt-6 space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-foreground">WhatsApp</h2>
        <p className="mt-1 text-xs text-muted">
          Leave the number blank to hide both WhatsApp buttons across the site.
        </p>
        <div className="mt-3 space-y-3">
          <div>
            <label className={labelClass}>Group chat invite link (optional)</label>
            <input
              type="url"
              name="whatsappGroupUrl"
              defaultValue={settings.whatsapp_group_url || ""}
              placeholder="https://chat.whatsapp.com/XXXXXXXXXXXXXXXXXXXXXX"
              className={fieldClass}
            />
            <p className="mt-1 text-xs text-muted">
              When set, every &quot;Chat on WhatsApp&quot; button opens this group instead of a
              one-to-one chat — the number and messages below are ignored while this is filled
              in. Get an invite link from WhatsApp: group info → Invite via link.
            </p>
          </div>
          <div>
            <label className={labelClass}>Number (with country code, no + or spaces)</label>
            <input
              type="text"
              name="whatsappNumber"
              defaultValue={settings.whatsapp_number || ""}
              placeholder="447488382205"
              className={fieldClass}
            />
            <p className="mt-1 text-xs text-muted">
              Used only when no group link is set above — opens a one-to-one chat with this
              number instead.
            </p>
          </div>
          <div>
            <label className={labelClass}>Floating button message</label>
            <input
              type="text"
              name="whatsappMessage"
              defaultValue={settings.whatsapp_message || ""}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Footer button message</label>
            <input
              type="text"
              name="footerWhatsappMessage"
              defaultValue={settings.footer_whatsapp_message || ""}
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-foreground">Social links</h2>
        <p className="mt-1 text-xs text-muted">
          Turn a platform off to hide its icon without losing the URL, or leave the URL blank.
        </p>
        <div className="mt-3 space-y-3">
          {SOCIAL_PLATFORMS.map((platform) => (
            <div key={platform.key}>
              <div className="flex items-center justify-between gap-3">
                <label className={labelClass} htmlFor={platform.key}>
                  {platform.label}
                </label>
                <ShowToggle
                  name={platform.enabledKey}
                  defaultChecked={settings[platform.enabledKey] !== false}
                />
              </div>
              <input
                id={platform.key}
                type="url"
                name={platform.key}
                defaultValue={settings[platform.key] || ""}
                placeholder="https://..."
                className={fieldClass}
              />
            </div>
          ))}
        </div>
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
