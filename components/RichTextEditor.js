"use client";

import { useEffect, useRef } from "react";
import { isLegacyPlainTextBody, legacyPlainTextToHtml } from "@/lib/blogBodyFormat";

const toolbarButtonClass =
  "rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-alt";
const toolbarSelectClass =
  "rounded-md border border-border bg-surface px-2 py-1.5 text-xs font-medium text-foreground";

const FONT_SIZES = [
  { label: "Small", value: "0.875em" },
  { label: "Normal", value: "" },
  { label: "Large", value: "1.25em" },
  { label: "X-Large", value: "1.5em" },
];

// A basic WYSIWYG editor for the blog post body: a contentEditable box with a formatting
// toolbar, kept in sync with a plain hidden <textarea name={name}> so the surrounding <form
// action={...}> (an uncontrolled Server Action form, like every other admin form in this
// codebase) submits exactly the same way it always has — nothing downstream needs to know the
// body is now edited visually instead of as raw text.
export default function RichTextEditor({ id, name, defaultValue, placeholder }) {
  const editorRef = useRef(null);
  const textareaRef = useRef(null);
  const savedRangeRef = useRef(null);

  // Initial content: legacy posts (saved before this editor existed) are plain text with no
  // HTML at all — rendered here the same way the public page used to render them, so opening
  // an old post looks right immediately instead of showing one giant unformatted block.
  useEffect(() => {
    // Chrome/Firefox default to wrapping each new line from Enter in a <div>; Safari differs
    // too. Forcing <p> keeps output consistent across browsers and matches what
    // lib/blogBodyFormat.js's legacy-content converter and lib/sanitizeBlogBody.js's allowlist
    // both already expect.
    document.execCommand("defaultParagraphSeparator", false, "p");
    const html = isLegacyPlainTextBody(defaultValue)
      ? legacyPlainTextToHtml(defaultValue)
      : defaultValue || "";
    editorRef.current.innerHTML = html;
    textareaRef.current.value = html;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function syncToTextarea() {
    textareaRef.current.value = editorRef.current.innerHTML;
  }

  // The "✨ Write with AI" button (components/AIAssistantButton.js) writes generated text
  // straight into this textarea's .value and dispatches an input event — this is what notices
  // that and refreshes the visual editor to match. Ignores the event while it's the sync
  // *target* of the contentEditable's own typing (see the DOM comment below) so normal typing
  // doesn't get clobbered mid-keystroke.
  function handleTextareaInput() {
    const html = isLegacyPlainTextBody(textareaRef.current.value)
      ? legacyPlainTextToHtml(textareaRef.current.value)
      : textareaRef.current.value;
    editorRef.current.innerHTML = html;
  }

  function saveSelection() {
    const sel = window.getSelection();
    if (sel.rangeCount && editorRef.current.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }

  // Toolbar controls steal focus from the editable region (clicking a button, or opening a
  // <select>) which collapses the text selection — this restores whatever was selected right
  // before that happened so "Bold" etc. still applies to the text the admin actually picked.
  function restoreSelection() {
    editorRef.current.focus();
    const sel = window.getSelection();
    sel.removeAllRanges();
    if (savedRangeRef.current) sel.addRange(savedRangeRef.current);
  }

  function runCommand(command, value = null) {
    restoreSelection();
    document.execCommand(command, false, value);
    saveSelection();
    syncToTextarea();
  }

  function applyStyle(e) {
    const tag = e.target.value;
    runCommand("formatBlock", tag === "P" ? "<p>" : `<${tag}>`);
    e.target.value = "";
  }

  // execCommand("fontSize") only supports the old 1-7 <font size> scale, not real CSS sizes —
  // wrapping the selection in a <span style="font-size:..."> by hand instead gives clean,
  // semantic output that lib/sanitizeBlogBody.js's allowlist already expects.
  function applyFontSize(e) {
    const size = e.target.value;
    e.target.value = "";
    restoreSelection();
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    if (size) span.style.fontSize = size;
    try {
      range.surroundContents(span);
    } catch {
      const content = range.extractContents();
      span.appendChild(content);
      range.insertNode(span);
    }
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.addRange(newRange);
    savedRangeRef.current = newRange.cloneRange();
    syncToTextarea();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 rounded-t-lg border border-b-0 border-border bg-surface-alt p-1.5">
        <select
          defaultValue=""
          onMouseDown={saveSelection}
          onChange={applyStyle}
          className={toolbarSelectClass}
          aria-label="Text style"
        >
          <option value="" disabled>
            Style
          </option>
          <option value="P">Normal text</option>
          <option value="H1">Heading 1</option>
          <option value="H2">Heading 2</option>
          <option value="H3">Heading 3</option>
          <option value="H4">Heading 4</option>
        </select>

        <select
          defaultValue=""
          onMouseDown={saveSelection}
          onChange={applyFontSize}
          className={toolbarSelectClass}
          aria-label="Font size"
        >
          <option value="" disabled>
            Font size
          </option>
          {FONT_SIZES.map((s) => (
            <option key={s.label} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runCommand("bold")}
          className={`${toolbarButtonClass} font-bold`}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runCommand("italic")}
          className={`${toolbarButtonClass} italic`}
          title="Italic"
        >
          I
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncToTextarea}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        data-placeholder={placeholder}
        className="blog-rich-content min-h-[12rem] rounded-b-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none [&:empty]:before:text-muted [&:empty]:before:content-[attr(data-placeholder)]"
      />

      <textarea ref={textareaRef} id={id} name={name} onInput={handleTextareaInput} hidden />
    </div>
  );
}
