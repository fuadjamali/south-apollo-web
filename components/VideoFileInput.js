"use client";

import { useState } from "react";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary-foreground";

const MAX_BYTES = 4.5 * 1024 * 1024;

function formatMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1);
}

// Same job as ImageFileInput but for a hero slide's background video — no crop step (cropping a
// video isn't something ImageCropModal's canvas-based approach handles, and a hero background
// video is expected to already be framed wide), just type/size validation before the file is
// attached to the real <input> for the surrounding Server Action to upload normally.
export default function VideoFileInput({
  name,
  label,
  currentVideo,
  previewClassName = "mt-2 h-32 w-full rounded-lg border border-border object-cover",
  helpText,
}) {
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError(`"${file.name}" isn't a video file.`);
      e.target.value = "";
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(
        `"${file.name}" is ${formatMB(file.size)}MB — the limit is 4.5MB. Trim the clip or compress it first.`
      );
      e.target.value = "";
      return;
    }

    setError("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  }

  const displaySrc = previewUrl || currentVideo;

  return (
    <div>
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {displaySrc && (
        <>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video src={displaySrc} className={previewClassName} muted loop autoPlay playsInline />
          {previewUrl && (
            <p className="mt-1 text-xs font-medium text-accent">New file — not saved yet</p>
          )}
        </>
      )}
      <input
        type="file"
        name={name}
        accept="video/*"
        onChange={handleChange}
        className={fieldClass}
      />
      <p className="mt-1 text-xs text-muted">
        {helpText || "Optional."} Short, muted, looping clips work best — max 4.5MB per file.
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
