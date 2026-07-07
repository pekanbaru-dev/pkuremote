import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "$env/dynamic/private";
import * as schema from "../../../../db/schema";

type Schema = typeof schema;
export type Database = PostgresJsDatabase<Schema>;

let cached: Database | null = null;

function getDb(): Database {
	if (cached) return cached;
	const databaseUrl = env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error(
			"DATABASE_URL is not set. Copy .env.example to .env and fill in the connection string for the app's Postgres."
		);
	}
	const client = postgres(databaseUrl, { prepare: false });
	cached = drizzle(client, { schema });
	return cached;
}

export const db = new Proxy({} as Database, {
	get(_target, prop) {
		const real = getDb();
		const value = Reflect.get(real, prop, real);
		return typeof value === "function" ? value.bind(real) : value;
	}
});
