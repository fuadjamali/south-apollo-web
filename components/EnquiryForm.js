"use client";

import { useState } from "react";

export default function EnquiryForm() {
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
        <p className="font-semibold text-foreground">Thanks — your enquiry has been sent.</p>
        <p className="mt-1 text-sm text-muted">We&apos;ll get back to you soon.</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-medium text-accent underline"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">Name</label>
          <input
            type="text"
            name="name"
            required
            placeholder="Your name"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Phone</label>
          <input
            type="tel"
            name="phone"
            placeholder="Optional"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Email</label>
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Message</label>
        <textarea
          name="message"
          rows={4}
          required
          placeholder="Tell us what you're looking for"
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Something went wrong — please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        {status === "loading" ? "Sending..." : "Send enquiry"}
      </button>
    </form>
  );
}
