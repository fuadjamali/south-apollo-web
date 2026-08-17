"use client";

import { useState } from "react";
import { generateAIContentAction } from "@/app/admin/(protected)/ai-assist/actions";

const textareaClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

// Fills a sibling field (identified by `targetId`) with AI-generated text. Deliberately reads
// and writes that field's value directly via the DOM rather than lifting it into React state —
// every form in this codebase is uncontrolled (defaultValue + FormData on submit), and this
// keeps the assistant a drop-in addition next to any of them without restructuring the form.
//
// Calls the server action directly as a function rather than via <form action={...}> — every
// usage site places this component inside another <form>, and HTML doesn't allow nested
// forms (the browser silently reparents a nested submit button to the outer form, which
// caused clicking "Generate" to submit the whole surrounding form instead).
export default function AIAssistantButton({ targetId, fieldLabel }) {
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState(null);

  async function handleGenerate() {
    setPending(true);
    const formData = new FormData();
    formData.set("instruction", instruction);
    formData.set("existingText", document.getElementById(targetId)?.value || "");
    formData.set("fieldLabel", fieldLabel);
    const res = await generateAIContentAction(null, formData);
    setPending(false);
    setResult(res);
  }

  function handleInsert() {
    const el = document.getElementById(targetId);
    if (el && result?.content) {
      el.value = result.content;
    }
    setOpen(false);
    setResult(null);
    setInstruction("");
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-accent hover:bg-surface-alt"
      >
        ✨ Write with AI
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-border bg-surface-alt p-3">
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            rows={2}
            placeholder='e.g. "Write a friendly 2-sentence description" or "Make this more concise"'
            className={textareaClass}
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={pending || !instruction.trim()}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              {pending ? "Generating..." : "Generate"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-muted hover:underline"
            >
              Cancel
            </button>
          </div>

          {result?.error && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{result.error}</p>
          )}

          {result?.content && (
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Preview</p>
              <p className="mt-1 whitespace-pre-line rounded-lg border border-border bg-surface p-2 text-sm text-foreground">
                {result.content}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleInsert}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover"
                >
                  Insert
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
