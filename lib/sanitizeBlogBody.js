import sanitizeHtml from "sanitize-html";

// Locks the blog body editor's output down to exactly what the toolbar in
// components/RichTextEditor.js can produce — headings, bold/italic, line breaks, and
// font-size spans — so pasted or hand-crafted markup can't smuggle in scripts, iframes, or
// anything else the public blog page would render unsanitized via dangerouslySetInnerHTML.
const OPTIONS = {
  allowedTags: ["h1", "h2", "h3", "h4", "p", "strong", "b", "em", "i", "br", "span"],
  allowedAttributes: {
    span: ["style"],
  },
  allowedStyles: {
    span: {
      "font-size": [/^\d+(\.\d+)?(px|rem|em)$/],
    },
  },
  allowedSchemes: [],
  disallowedTagsMode: "discard",
};

export function sanitizeBlogBody(html) {
  if (!html) return html;
  return sanitizeHtml(html, OPTIONS);
}
