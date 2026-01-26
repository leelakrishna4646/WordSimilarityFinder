import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// For this project we can tolerate missing DATABASE_URL since we use MemStorage
// But ideally it should be present.
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres" 
});

export const db = drizzle(pool, { schema });
