import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "$env/dynamic/private";
import * as schema from "../../../../db/schema";

const databaseUrl = env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error(
		"DATABASE_URL is not set. Copy .env.example to .env and fill in the Supabase pooler URL."
	);
}

const client = postgres(databaseUrl, { prepare: false });
export const db = drizzle(client, { schema });

export type Database = typeof db;
