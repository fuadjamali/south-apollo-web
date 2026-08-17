"use client";

import { useActionState } from "react";
import { updateAISettingsAction } from "@/app/admin/(protected)/ai-settings/actions";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function AISettingsForm({ enabled, maskedKey, hasEnvFallback }) {
  const [state, formAction, pending] = useActionState(updateAISettingsAction, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="ai-enabled"
          name="enabled"
          defaultChecked={enabled}
          className="h-4 w-4 rounded border-border"
        />
        <label htmlFor="ai-enabled" className="text-sm font-medium text-foreground">
          Enable AI Assist
        </label>
      </div>
      <p className="text-xs text-muted">
        Turns the &quot;Write with AI&quot; button on or off across the whole admin panel —
        switch it off any time to stop API usage and cost without losing your saved key.
      </p>

      <div className="border-t border-border pt-4">
        <label className="block text-sm font-medium text-foreground">API key</label>
        {maskedKey ? (
          <p className="mt-1 text-sm text-muted">
            Currently set: <span className="font-mono">{maskedKey}</span>
          </p>
        ) : hasEnvFallback ? (
          <p className="mt-1 text-sm text-muted">
            No key saved here — currently using the <code>ANTHROPIC_API_KEY</code> environment
            variable instead.
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted">
            No key configured yet. Get one at{" "}
            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              console.anthropic.com
            </a>
            .
          </p>
        )}
        <input
          type="password"
          name="apiKey"
          placeholder={maskedKey ? "Paste a new key to replace it" : "Paste your API key"}
          autoComplete="off"
          className={fieldClass}
        />
        {maskedKey && (
          <label className="mt-2 flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" name="clearKey" className="h-4 w-4 rounded border-border" />
            Remove the saved key{hasEnvFallback ? " (falls back to the environment variable)" : ""}
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
