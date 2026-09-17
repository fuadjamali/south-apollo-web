import { getCurrentTeamsWithMembers, getFormerTeamsWithMembers } from "@/lib/teamMembers";
import { getSectionHeadings } from "@/lib/sectionHeadings";
import { buildPageMetadata } from "@/lib/seo";
import TeamRoster from "@/components/TeamRoster";

export const revalidate = 3600;

export async function generateMetadata() {
  const headings = await getSectionHeadings();
  return buildPageMetadata({
    title: "Team",
    description: headings.team.subheading,
    path: "/team",
  });
}

export default async function TeamPage() {
  const [headings, currentTeams, formerTeams] = await Promise.all([
    getSectionHeadings(),
    getCurrentTeamsWithMembers(),
    getFormerTeamsWithMembers(),
  ]);
  const { team } = headings;

  return (
    <div>
      <h1 className="text-center text-3xl font-bold">{team.heading}</h1>
      <p className="mt-2 text-center text-muted">{team.subheading}</p>

      {currentTeams.length === 0 && formerTeams.length === 0 ? (
        <p className="mt-10 text-center text-muted">No team members yet.</p>
      ) : (
        <div className="mt-10">
          <TeamRoster currentTeams={currentTeams} formerTeams={formerTeams} />
        </div>
      )}
    </div>
  );
}
