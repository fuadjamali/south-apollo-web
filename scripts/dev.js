const { spawn, spawnSync } = require("child_process");

// Starts everything a local dev session needs, in order: confirm Docker is reachable, bring up
// the Postgres container (docker-compose.yml's `postgres` service, container name
// south-apollo-web-db), wait until it's actually accepting connections, then run `next dev`. Replaces
// the usual manual routine — "is Docker running? -> docker compose up -d -> wait a few seconds
// -> npm run dev" — with one command.
//
// Run with: npm run dev:full  (or `node scripts/dev.js` directly)
//
// Deliberately does NOT try to launch Docker Desktop itself if it's not running — that's a
// separate, platform-specific app outside this project, not something a repo script should be
// reaching out to start. It just checks, and tells you to start it yourself.

const DB_CONTAINER = "south-apollo-web-db";
const DB_USER = "south_apollo";
const MAX_WAIT_MS = 30000;
const POLL_INTERVAL_MS = 1000;

function checkDockerRunning() {
  const result = spawnSync("docker", ["info"], { stdio: "ignore" });
  return result.status === 0;
}

function startDbContainer() {
  console.log(`Starting ${DB_CONTAINER}...`);
  const result = spawnSync("docker", ["compose", "up", "-d", "postgres"], {
    stdio: "inherit",
  });
  if (result.status !== 0) {
    console.error("Failed to start the database container.");
    process.exit(1);
  }
}

function isDbReady() {
  const result = spawnSync("docker", ["exec", DB_CONTAINER, "pg_isready", "-U", DB_USER], {
    stdio: "ignore",
  });
  return result.status === 0;
}

async function waitForDb() {
  const start = Date.now();
  process.stdout.write("Waiting for Postgres to accept connections");
  while (Date.now() - start < MAX_WAIT_MS) {
    if (isDbReady()) {
      console.log(" ready.");
      return true;
    }
    process.stdout.write(".");
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  console.log();
  return false;
}

function runNextDev() {
  console.log("Starting Next.js dev server...\n");
  // Command passed as one string (not an args array) — Node warns (DEP0190) against combining
  // shell:true with an argv array, since shells don't escape array elements the way spawn()
  // does without a shell. Nothing here is user input, but a single string sidesteps the warning
  // entirely rather than suppressing it.
  const child = spawn("npx next dev", { stdio: "inherit", shell: true });
  // Forward Ctrl+C / termination signals to the child so `next dev` shuts down cleanly instead
  // of being orphaned when this wrapper process exits.
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => child.kill(signal));
  }
  child.on("exit", (code) => process.exit(code ?? 0));
}

async function main() {
  if (!checkDockerRunning()) {
    console.error("Docker doesn't seem to be running. Start Docker Desktop, then run this again.");
    process.exit(1);
  }

  startDbContainer();

  const ready = await waitForDb();
  if (!ready) {
    console.error(
      `Postgres in ${DB_CONTAINER} didn't become ready within ${MAX_WAIT_MS / 1000}s — check ` +
        `\`docker logs ${DB_CONTAINER}\` for details.`
    );
    process.exit(1);
  }

  runNextDev();
}

main();
