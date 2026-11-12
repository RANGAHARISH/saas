import "dotenv/config"

import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import * as schema from "./schema"

// Next.js may import database modules while collecting page data during a
// build, when runtime environment variables are not available. Keep pool
// construction safe until a database connection is actually requested.
const connectionString = process.env.DATABASE_URL

const needsSSL =
  connectionString?.includes("supabase.co") ||
  connectionString?.includes("pooler.supabase") ||
  connectionString?.includes("sslmode=require")

// node-postgres reparses connection-string SSL options after merging the
// explicit `ssl` object, so `sslmode=require` overrides `rejectUnauthorized`.
// Keep TLS enabled with the Supabase settings below while removing that
// duplicate URL option before handing the connection string to pg.
const poolConnectionString = (() => {
  if (!connectionString || !needsSSL) return connectionString

  const url = new URL(connectionString)
  url.searchParams.delete("sslmode")
  return url.toString()
})()

const pool = new Pool({
  ...(poolConnectionString ? { connectionString: poolConnectionString } : {}),
  ...(needsSSL ? { ssl: { rejectUnauthorized: false } } : {}),
  max: 10,
  // Perf/robustness (audit L1): fail fast instead of hanging forever when the
  // database is unreachable or a query stalls. Values are generous on purpose.
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
})

export const db = drizzle(pool, {
  schema,
})
