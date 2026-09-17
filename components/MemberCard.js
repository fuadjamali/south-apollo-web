// Shared team-member card — used by both the full /team roster (components/TeamRoster.js) and
// the home page "Meet our team" preview block (app/page.js). Previously an inline copy in each
// place that had drifted into being pixel-identical by discipline, not by sharing code; this is
// the shared component the docs/team-people-internals.md porting notes' callout says to extract
// instead of carrying that duplication forward.
export default function MemberCard({ member, className = "" }) {
  return (
    <div className={`rounded-xl border border-border p-4 ${className}`}>
      {member.photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={member.photo} alt="" className="mb-3 h-16 w-16 rounded-full object-cover" />
      )}
      <p className="font-semibold text-foreground">{member.name}</p>
      {member.title && <p className="mt-1 text-sm text-muted">{member.title}</p>}
    </div>
  );
}
