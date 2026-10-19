import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    throw new Error("DATABASE_URL is not set");
}

export const pool = new Pool({ connectionString: dbUrl });
export const db = drizzle(pool, { schema });