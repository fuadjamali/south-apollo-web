"use client";

import { useState } from "react";

export default function CopyLinkButton({ link, className }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" onClick={handleCopy} className={className}>
      {copied ? "Copied!" : "Copy reset link"}
    </button>
  );
}
