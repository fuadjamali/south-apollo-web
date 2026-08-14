"use client";

export default function CategoryFilter({ categories, selected }) {
  return (
    <form method="GET" className="flex items-center justify-center gap-2">
      <label htmlFor="category-filter" className="text-sm text-muted">
        Filter by category:
      </label>
      <select
        id="category-filter"
        name="category"
        defaultValue={selected || ""}
        onChange={(e) => e.target.form.requestSubmit()}
        className="rounded-lg border border-border bg-surface px-2 py-1 text-sm text-foreground"
      >
        <option value="">All categories</option>
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
          Filter
        </button>
      </noscript>
    </form>
  );
}
