"use client";

import { useActionState, useState } from "react";
import { submitTestimonialAction } from "@/app/leave-a-review/actions";
import { useT } from "@/components/LocaleContext";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none";

export default function TestimonialForm({ member }) {
  const t = useT();
  const [rating, setRating] = useState(0);
  const [state, formAction, pending] = useActionState(submitTestimonialAction, {});

  if (state?.success) {
    return (
      <p className="mt-6 rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm text-foreground">
        {t("review.thanks")}
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="rating" value={rating} />

      <div>
        <label className="block text-sm font-medium text-foreground">{t("review.rating")}</label>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              aria-label={t(star === 1 ? "review.starOne" : "review.starMany", { count: star })}
              className={`text-2xl leading-none ${
                star <= rating ? "text-yellow-500" : "text-gray-300 dark:text-gray-600"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">{t("review.yourName")}</label>
        <input
          type="text"
          name="authorName"
          required
          defaultValue={member?.name}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">{t("review.emailOptional")}</label>
        <input
          type="email"
          name="authorEmail"
          defaultValue={member?.email}
          className={fieldClass}
        />
        <p className="mt-1 text-xs text-muted">
          {t("review.emailHint")}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">{t("review.yourReview")}</label>
        <textarea name="body" rows={4} required className={fieldClass} />
      </div>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || rating === 0}
        className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        {pending ? t("review.submitting") : t("review.submit")}
      </button>
    </form>
  );
}
