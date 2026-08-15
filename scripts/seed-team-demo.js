// One-off demo data script — populates 3 realistic teams with 10 members each (3 per team
// flagged "show on home") for pitch/demo purposes. Not run automatically; invoke with:
//   node --env-file=.env.local scripts/seed-team-demo.js
// Replaces whatever teams/team_members currently exist (deletes them first).
const { Pool } = require("pg");

const TEAMS = [
  {
    name: "Leadership",
    description: "The people setting the direction.",
    display_order: 1,
    members: [
      { name: "Olivia Bennett", title: "Chief Executive Officer", home: true },
      { name: "Marcus Reyes", title: "Chief Operating Officer", home: true },
      { name: "Priya Nathan", title: "Chief Financial Officer", home: true },
      { name: "Daniel Foster", title: "Chief Technology Officer", home: false },
      { name: "Grace Ellison", title: "VP of Sales", home: false },
      { name: "Tomasz Kowalski", title: "VP of Marketing", home: false },
      { name: "Hana Watanabe", title: "VP of Product", home: false },
      { name: "Leon Whitfield", title: "Head of HR", home: false },
      { name: "Camille Dubois", title: "General Counsel", home: false },
      { name: "Isaac Odom", title: "Chief of Staff", home: false },
    ],
  },
  {
    name: "Engineering",
    description: "The people who build the product.",
    display_order: 2,
    members: [
      { name: "Ava Sinclair", title: "Engineering Manager", home: true },
      { name: "Noah Kessler", title: "Senior Backend Engineer", home: true },
      { name: "Mei Lin Chao", title: "Senior Frontend Engineer", home: true },
      { name: "Ethan Marsh", title: "Backend Engineer", home: false },
      { name: "Sofia Almeida", title: "Frontend Engineer", home: false },
      { name: "Ryan O'Connell", title: "DevOps Engineer", home: false },
      { name: "Nadia Petrov", title: "QA Engineer", home: false },
      { name: "Jamal Carter", title: "Mobile Engineer", home: false },
      { name: "Elin Johansson", title: "Data Engineer", home: false },
      { name: "Victor Huang", title: "Security Engineer", home: false },
    ],
  },
  {
    name: "Customer Success",
    description: "The people making sure clients get real value.",
    display_order: 3,
    members: [
      { name: "Chloe Ramirez", title: "Head of Customer Success", home: true },
      { name: "Benjamin Okafor", title: "Senior Customer Success Manager", home: true },
      { name: "Freya Lindqvist", title: "Customer Success Manager", home: true },
      { name: "Dmitri Volkov", title: "Support Lead", home: false },
      { name: "Amara Osei", title: "Support Specialist", home: false },
      { name: "Lucas Ferreira", title: "Onboarding Specialist", home: false },
      { name: "Ingrid Solberg", title: "Technical Support Engineer", home: false },
      { name: "Youssef Haddad", title: "Account Manager", home: false },
      { name: "Petra Novak", title: "Customer Success Ops", home: false },
      { name: "Miles Anderson", title: "Renewals Manager", home: false },
    ],
  },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  // Self-healing tables — same schema as lib/teams.js / lib/teamMembers.js.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      display_order INT NOT NULL DEFAULT 0,
      show_on_home BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS team_members (
      id SERIAL PRIMARY KEY,
      id_no VARCHAR(50),
      name VARCHAR(255) NOT NULL,
      title VARCHAR(255),
      contact_no VARCHAR(50),
      email VARCHAR(255),
      service_join_date DATE,
      service_end_date DATE,
      team_id INT REFERENCES teams(id) ON DELETE CASCADE,
      active BOOLEAN NOT NULL DEFAULT true,
      show_on_home BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // Replace whatever's there now (placeholder seed data from earlier testing) with the
  // full demo set. team_members cascades on team delete.
  await pool.query("DELETE FROM teams");

  let empCounter = 1;
  for (const team of TEAMS) {
    const { rows } = await pool.query(
      "INSERT INTO teams (name, description, display_order, show_on_home) VALUES ($1, $2, $3, true) RETURNING id",
      [team.name, team.description, team.display_order]
    );
    const teamId = rows[0].id;

    for (const member of team.members) {
      const idNo = `EMP-${String(empCounter).padStart(3, "0")}`;
      empCounter += 1;
      await pool.query(
        `INSERT INTO team_members (id_no, name, title, team_id, active, show_on_home)
         VALUES ($1, $2, $3, $4, true, $5)`,
        [idNo, member.name, member.title, teamId, member.home]
      );
    }

    console.log(`Seeded team "${team.name}" with ${team.members.length} members`);
  }

  await pool.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
