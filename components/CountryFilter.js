"use client";

export default function CountryFilter({ countries, selected }) {
  return (
    <form method="GET" className="flex items-center gap-2">
      <label htmlFor="country-filter" className="text-sm text-muted">
        Filter by country:
      </label>
      <select
        id="country-filter"
        name="country"
        defaultValue={selected || ""}
        onChange={(e) => e.target.form.requestSubmit()}
        className="rounded-lg border border-border bg-surface px-2 py-1 text-sm text-foreground"
      >
        <option value="">All countries</option>
        {countries.map((c) => (
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
