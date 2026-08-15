export default function VisitsBarChart({ data }) {
  const maxCount = Math.max(1, ...data.map((d) => d.count));
  const barWidth = 100 / data.length;

  return (
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className="h-40 w-full"
      role="img"
      aria-label="Daily site visits for the current month"
    >
      {data.map((d, i) => {
        const height = (d.count / maxCount) * 36;
        return (
          // A nested SVG <title> child here triggers a React SSR/hydration mismatch (React's
          // raw-text-element special-casing for <title>/<script>/<style> doesn't correctly
          // account for the SVG namespace) — aria-label gives the same per-bar accessible
          // description without hitting that bug, just without a native hover tooltip.
          <rect
            key={d.day}
            x={i * barWidth + barWidth * 0.15}
            y={40 - height}
            width={barWidth * 0.7}
            height={height}
            className="fill-primary"
            aria-label={`Day ${d.day}: ${d.count} visit${d.count === 1 ? "" : "s"}`}
          />
        );
      })}
    </svg>
  );
}
