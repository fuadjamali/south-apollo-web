"use client";

import { useEffect, useState } from "react";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary-foreground";

const MAX_BYTES = 4.5 * 1024 * 1024;

function formatMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1);
}

// Shared file input for every admin image/logo/photo field. Vercel caps a server
// action's request body at 4.5MB, so an oversized file always fails on the server —
// this catches it client-side first with a clear message instead of letting the
// upload crash to the generic error boundary.
export default function ImageFileInput({
  name,
  label,
  currentImage,
  required,
  previewClassName = "mt-2 h-24 w-24 rounded-lg border border-border object-cover",
  helpText,
}) {
  const [error, setError] = useState("");
  // Object URL for the file just picked in this session — distinct from `currentImage` (the
  // already-saved value), so a chosen replacement shows up immediately instead of only after
  // Save reloads the page. Revoked on cleanup/replacement so picking several files in a row
  // doesn't leak blob URLs.
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleChange(e) {
    const file = e.target.files?.[0];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    if (!file) {
      setError("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError(`"${file.name}" isn't an image file.`);
      e.target.value = "";
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(
        `"${file.name}" is ${formatMB(file.size)}MB — the limit is 4.5MB. Choose a smaller file or compress it first.`
      );
      e.target.value = "";
      return;
    }
    setError("");
    setPreviewUrl(URL.createObjectURL(file));
  }

  const displayImage = previewUrl || currentImage;

  return (
    <div>
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {displayImage && (
        <>
          <img src={displayImage} alt="" className={previewClassName} />
          {previewUrl && (
            <p className="mt-1 text-xs font-medium text-accent">New file — not saved yet</p>
          )}
        </>
      )}
      <input
        type="file"
        name={name}
        accept="image/*"
        required={required}
        onChange={handleChange}
        className={fieldClass}
      />
      <p className="mt-1 text-xs text-muted">
        {helpText || (currentImage ? "Choose a file to replace it, or leave blank to keep it." : "Optional.")}{" "}
        Any image format (JPG, PNG, WebP, GIF, SVG) — max 4.5MB per file. No fixed pixel size or
        aspect ratio required.
      </p>
      {error && (
        <p
          role="alert"
          className="mt-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
