export default function DetailField({ label, value, className = "" }) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 whitespace-pre-line text-sm text-foreground">{value}</p>
    </div>
  );
}
