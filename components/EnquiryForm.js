"use client";

import { useState } from "react";
import { useT } from "@/components/LocaleContext";

export default function EnquiryForm() {
  const t = useT();
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");

    const form = e.target;
    const payload = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      message: form.message.value,
    };

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-10 rounded-lg border border-border bg-surface p-6 text-center">
        <p className="font-semibold text-foreground">{t("enquiry.sentTitle")}</p>
        <p className="mt-1 text-sm text-muted">{t("enquiry.sentBody")}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-medium text-accent underline"
        >
          {t("enquiry.sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">{t("enquiry.name")}</label>
          <input
            type="text"
            name="name"
            required
            placeholder={t("enquiry.namePlaceholder")}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">{t("enquiry.phone")}</label>
          <input
            type="tel"
            name="phone"
            placeholder={t("common.optional")}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">{t("enquiry.email")}</label>
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">{t("enquiry.message")}</label>
        <textarea
          name="message"
          rows={4}
          required
          placeholder={t("enquiry.messagePlaceholder")}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {t("common.genericError")}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        {status === "loading" ? t("enquiry.sending") : t("enquiry.submit")}
      </button>
    </form>
  );
}
