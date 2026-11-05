import "dotenv/config"

import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import * as schema from "./schema"

const connectionString = process.env.DATABASE_URL!

const needsSSL =
  connectionString.includes("supabase.co") ||
  connectionString.includes("pooler.supabase") ||
  connectionString.includes("sslmode=require")

const pool = new Pool({
  connectionString,
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
