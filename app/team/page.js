import { getAllTeamsWithActiveMembers } from "@/lib/teamMembers";
import { getSectionHeadings } from "@/lib/sectionHeadings";

export const revalidate = 3600;

export async function generateMetadata() {
  const headings = await getSectionHeadings();
  return { title: "Team", description: headings.team.subheading };
}

export default async function TeamPage() {
  const [headings, teamGroups] = await Promise.all([
    getSectionHeadings(),
    getAllTeamsWithActiveMembers(),
  ]);
  const { team } = headings;

  return (
    <div>
      <h1 className="text-center text-3xl font-bold">{team.heading}</h1>
      <p className="mt-2 text-center text-muted">{team.subheading}</p>

      {teamGroups.length === 0 ? (
        <p className="mt-10 text-center text-muted">No team members yet.</p>
      ) : (
        <div className="mt-10 space-y-12">
          {teamGroups.map((group) => (
            <div key={group.id}>
              <h2 className="text-lg font-semibold text-foreground">{group.name}</h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.members.map((member) => (
                  <div
                    key={member.id}
                    className="rounded-xl border border-border bg-surface p-4"
                  >
                    {member.photo && (
                      <img
                        src={member.photo}
                        alt=""
                        className="mb-3 h-16 w-16 rounded-full object-cover"
                      />
                    )}
                    <p className="font-semibold text-foreground">{member.name}</p>
                    {member.title && (
                      <p className="mt-1 text-sm text-muted">{member.title}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
