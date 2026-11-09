import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_URL_POOLED = process.env.DATABASE_URL_POOLED;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required.");
}

// Pooled connection for application runtime.
// Prefer the connection pooler URL when available; fall back to the direct URL.
const connectionString = DATABASE_URL_POOLED ?? DATABASE_URL;

const pool = new Pool({ connectionString });

export const db = drizzle(pool, { schema });

export type Database = typeof db;
