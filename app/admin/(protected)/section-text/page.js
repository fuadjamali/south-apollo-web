import { getSectionHeadings, SECTION_DEFS } from "@/lib/sectionHeadings";
import SectionHeadingForm from "@/components/SectionHeadingForm";

export const dynamic = "force-dynamic";

export default async function AdminSectionTextPage() {
  const headings = await getSectionHeadings();

  return (
    <div className="w-full max-w-3xl px-6">
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Section Text</h1>
        <p className="mt-1 text-sm text-muted">
          The heading and subheading shown above each home page section. Turning a section on or
          off is done separately, in Settings → Feature Config.
        </p>

        <div className="mt-6 space-y-5 divide-y divide-border">
          {SECTION_DEFS.map((def) => (
            <div key={def.key} className="pt-5 first:pt-0">
              <SectionHeadingForm def={def} values={headings[def.key] || {}} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
