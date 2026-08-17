import { Pool } from "pg";

const globalForDb = globalThis;

function createPool() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  // Some pooled Postgres providers (e.g. Neon's pgbouncer endpoint) don't apply a role/database
  // default search_path to connections it hands out, and Neon's pooler outright rejects
  // search_path passed as a connection-string startup parameter — so every unqualified
  // CREATE TABLE/query across lib/*.js would fail with "no schema has been selected to create
  // in" despite `public` existing. Setting it explicitly on every new connection works
  // regardless of the provider's pooling behavior or defaults.
  pool.on("connect", (client) => {
    client.query("SET search_path TO public");
  });
  return pool;
}

export const db = globalForDb.pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = db;
}
