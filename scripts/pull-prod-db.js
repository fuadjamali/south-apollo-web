// Refreshes the local dev database with a full copy of production's — the same manual dump/
// restore steps folded into one command, for whenever local content has drifted from prod and
// you want a clean baseline again. Not automatic: local and prod diverge again the moment either
// one is edited afterward, and that's expected — this is a "pull fresh state on demand" tool,
// not a live sync.
//
// Requires the `pg_dump`/`pg_restore` client tools on PATH (part of any PostgreSQL install) and
// PROD_DATABASE_URL set in .env.local (see .env.local.example) — that's production's real
// DATABASE_URL, copied from Vercel's dashboard, since it can't be read back via the Vercel CLI
// (it's stored there as a write-only Secret).
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const LOCAL_URL = process.env.DATABASE_URL;
const PROD_URL = process.env.PROD_DATABASE_URL;

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!LOCAL_URL) fail("DATABASE_URL isn't set — check .env.local.");
if (!PROD_URL) {
  fail(
    "PROD_DATABASE_URL isn't set. Add it to .env.local: production's real DATABASE_URL, from " +
      "Vercel → your project → Settings → Environment Variables. See .env.local.example."
  );
}

// The one safeguard that actually matters here: this command's whole job is to DROP AND OVERWRITE
// whatever DATABASE_URL points at. If that's ever pointed at something other than local Postgres
// (a misconfigured .env.local, a copy-paste mistake), this must refuse rather than silently wipe
// the wrong database — there is no confirmation prompt after this point.
const localHost = new URL(LOCAL_URL).hostname;
if (!["localhost", "127.0.0.1"].includes(localHost)) {
  fail(
    `Refusing to run: DATABASE_URL's host is "${localHost}", not localhost.\n` +
      "This script overwrites whatever DATABASE_URL points at — it must only ever target your " +
      "local dev Postgres, never a remote one (including production itself)."
  );
}

const dumpPath = path.join(os.tmpdir(), `south-apollo-web-prod-pull-${Date.now()}.dump`);

try {
  console.log("Dumping production...");
  execFileSync("pg_dump", [PROD_URL, "-Fc", "-f", dumpPath], { stdio: "inherit" });

  console.log("Restoring into local (this replaces your local data)...");
  execFileSync(
    "pg_restore",
    ["-d", LOCAL_URL, "--clean", "--if-exists", "--no-owner", "--no-privileges", dumpPath],
    { stdio: "inherit" }
  );
  // pg_restore exits non-zero on ANY warning (e.g. harmless server-version-mismatch notices),
  // not just real failures — execFileSync throwing here doesn't necessarily mean the restore
  // didn't work, so this isn't wrapped in a try/catch that treats every throw as fatal.

  console.log("Done — local now matches production as of this moment.");
} finally {
  fs.rmSync(dumpPath, { force: true });
}
