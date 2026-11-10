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

const pool = new Pool({
  ...(connectionString ? { connectionString } : {}),
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
