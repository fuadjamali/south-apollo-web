// Posts written before the rich text editor (components/RichTextEditor.js) shipped have a
// plain-text `body` — no HTML tags at all, paragraphs separated by a blank line. Used both to
// open an old post in the new editor and to render it on the public page, so both places treat
// legacy content identically until it's re-saved (at which point it becomes real HTML).
export function isLegacyPlainTextBody(body) {
  return Boolean(body) && !/<[a-z][\s\S]*>/i.test(body);
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Mirrors the public page's old rendering (split on blank lines -> one <p> per paragraph).
export function legacyPlainTextToHtml(body) {
  return (body || "")
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}
