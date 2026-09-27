"use client";

import { useT } from "@/components/LocaleContext";

export default function CategoryFilter({ categories, selected }) {
  const t = useT();
  return (
    <form method="GET" className="flex items-center justify-center gap-2">
      <label htmlFor="category-filter" className="text-sm text-muted">
        {t("products.filterLabel")}
      </label>
      <select
        id="category-filter"
        name="category"
        defaultValue={selected || ""}
        onChange={(e) => e.target.form.requestSubmit()}
        className="rounded-lg border border-border bg-surface px-2 py-1 text-sm text-foreground"
      >
        <option value="">{t("products.allCategories")}</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <noscript>
        <button
          type="submit"
          className="rounded-lg border border-border px-2 py-1 text-sm text-foreground"
        >
          {t("products.filter")}
        </button>
      </noscript>
    </form>
  );
}
