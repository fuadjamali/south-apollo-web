import { getCurrentTeamsWithMembers, getFormerTeamsWithMembers } from "@/lib/teamMembers";
import { getSectionHeadings } from "@/lib/sectionHeadings";
import { buildPageMetadata } from "@/lib/seo";
import { getT } from "@/lib/i18n/server";
import TeamRoster from "@/components/TeamRoster";

export const revalidate = 3600;

export async function generateMetadata() {
  const { locale, t } = await getT();
  const headings = await getSectionHeadings(locale);
  return buildPageMetadata({
    title: t("pages.team"),
    description: headings.team.subheading,
    path: "/team",
  });
}

export default async function TeamPage() {
  const { locale, t } = await getT();
  const [headings, currentTeams, formerTeams] = await Promise.all([
    getSectionHeadings(locale),
    getCurrentTeamsWithMembers(),
    getFormerTeamsWithMembers(),
  ]);
  const { team } = headings;

  return (
    <div>
      <h1 className="text-center text-3xl font-bold">{team.heading}</h1>
      <p className="mt-2 text-center text-muted">{team.subheading}</p>

      {currentTeams.length === 0 && formerTeams.length === 0 ? (
        <p className="mt-10 text-center text-muted">{t("team.empty")}</p>
      ) : (
        <div className="mt-10">
          <TeamRoster currentTeams={currentTeams} formerTeams={formerTeams} />
        </div>
      )}
    </div>
  );
}
