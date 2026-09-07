// Renders History as a real vertical timeline instead of the generic heading/body/image block
// every other text section (About, Vision & Mission) uses — only when the admin has actually
// added milestones (lib/historyMilestones.js); app/page.js falls back to the plain
// ImageTextSection render otherwise, so a site that never adds milestones sees no change.
export default function HistoryTimeline({ heading, subheading, milestones, sectionStyle, maxW }) {
  return (
    <section id="history" className="py-20" style={sectionStyle}>
      <div className={`mx-auto ${maxW} px-6`}>
        <h2 className="text-center text-3xl font-bold">{heading}</h2>
        {subheading && <p className="mt-2 text-center text-muted">{subheading}</p>}

        <div className="mx-auto mt-12 max-w-2xl">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="relative flex gap-6 pb-10 last:pb-0">
              {index < milestones.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-[27px] top-14 h-[calc(100%-3.5rem)] w-px bg-border"
                />
              )}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {milestone.year}
              </div>
              <div className="pt-2">
                <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                {milestone.description && (
                  <p className="mt-1 text-sm text-muted">{milestone.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
